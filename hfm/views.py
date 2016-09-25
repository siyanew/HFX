import json
import os
import subprocess
import time

import requests
from django.shortcuts import render

from HDFSFM.settings import MEDIA_ROOT, HADOOP_HOME, HADOOP_USERNAME, HADOOP_PASSWORD, HADOOP_MASTER_ADDRESS


def sizeof_fmt(numstr, suffix='B'):
    num = int(numstr)
    for unit in ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z']:
        if abs(num) < 1024.0:
            return "%3.1f%s%s" % (num, unit, suffix)
        num /= 1024.0
    return "%.1f%s%s" % (num, 'Yi', suffix)


def ls(request):
    data = requests.get("http://{}/webhdfs/v1/?op=LISTSTATUS".format(HADOOP_MASTER_ADDRESS)).text
    files_json = json.loads(data)['FileStatuses']['FileStatus']
    ls = []

    for i in files_json:
        file = {'Permission': i['permission']}
        if i['type'] == 'DIRECTORY':
            file['IsDirectory'] = True
            file['Type'] = "folder-o"
        else:
            file['IsDirectory'] = False
            file['Type'] = "file-text-o"
        file['Replication'] = i['replication']
        file['Owner'] = i['owner']
        file['Group'] = i['group']
        file['Size'] = sizeof_fmt(i['length'])
        file['BlockSize'] = sizeof_fmt(i['blockSize'])
        file['Last_Modified'] = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(int(str(i['modificationTime'])[:-3])))
        file['name'] = i['pathSuffix']
        file['IsCopying'] = True if i['pathSuffix'].endswith("_COPYING_") else False
        file['address'] = "/" + i['pathSuffix']
        ls.append(file)
    return render(request, 'hfm/ls.html', {'files': ls, 'pwd': "/", "HADOOP_MASTER_ADDRESS": HADOOP_MASTER_ADDRESS})


def ls_address(request):
    src = request.GET.get("src", "")
    data = requests.get("http://{}/webhdfs/v1{}?op=LISTSTATUS".format(HADOOP_MASTER_ADDRESS, src)).text
    files_json = json.loads(data)['FileStatuses']['FileStatus']
    if not src:
        src = "/"
        parent = None
    else:
        parent = os.path.dirname(src.rstrip("/"))
        if src[-1] != "/":
            src += "/"

    ls = []

    for i in files_json:
        file = {'Permission': i['permission']}
        if i['type'] == 'DIRECTORY':
            file['IsDirectory'] = True
            file['Type'] = "folder-o"
        else:
            file['IsDirectory'] = False
            file['Type'] = "file-text-o"
        file['Replication'] = i['replication']
        file['Owner'] = i['owner']
        file['Group'] = i['group']
        file['Size'] = sizeof_fmt(i['length'])
        file['BlockSize'] = sizeof_fmt(i['blockSize'])
        file['Last_Modified'] = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(int(str(i['modificationTime'])[:-3])))
        file['name'] = i['pathSuffix']
        file['IsCopying'] = True if i['pathSuffix'].endswith("_COPYING_") else False
        file['address'] = src + i['pathSuffix']
        ls.append(file)

    return render(request, 'hfm/ls_table.html',
                  {'files': ls, 'parent': parent, 'pwd': src, "HADOOP_MASTER_ADDRESS": HADOOP_MASTER_ADDRESS})


def cat(request):
    src = request.GET.get("src", "")

    if not src:
        return render(request, 'hfm/content.html', {'content': None})

    p1 = subprocess.Popen([HADOOP_HOME + 'hadoop', 'fs', "-cat", src], stdout=subprocess.PIPE)

    cat = p1.communicate()[0].decode()
    if "No such file or directory" in cat:
        return render(request, 'hfm/content.html', {'content': "error"})
    return render(request, 'hfm/content.html', {'content': cat})


def put(src, dest):
    p1 = subprocess.Popen(
        ['echo "{}" | sudo -S su - {} -c "{}hadoop fs -put {} {}"'.format(HADOOP_PASSWORD, HADOOP_USERNAME, HADOOP_HOME,
                                                                          src.replace(" ", "%20"),
                                                                          dest.replace(" ", "_"))], shell=True,
        stdout=subprocess.PIPE)

    put = p1.communicate()[0].decode()
    os.remove(src)


def rename(request):
    src = request.GET.get("src", "")
    dest = request.GET.get("dest", "")
    data = requests.put(
        "http://{}/webhdfs/v1{}?user.name={}&op=RENAME&destination={}".format(HADOOP_MASTER_ADDRESS, src,
                                                                              HADOOP_USERNAME, dest)).text
    files_json = json.loads(data)
    print(files_json)
    return render(request, 'hfm/content.html', {'content': "ok"})


def copy(request):
    src = request.GET.get("src", "")
    dest = request.GET.get("dest", "")
    p1 = subprocess.Popen(
        ['echo "{}" | sudo -S su - {} -c "{}hadoop fs -cp {} {}"'.format(HADOOP_PASSWORD, HADOOP_USERNAME, HADOOP_HOME,
                                                                         src, dest.replace(" ", "_"))], shell=True,
        stdout=subprocess.PIPE)
    return render(request, 'hfm/content.html', {'content': "ok"})


def delete_file(request):
    src = request.GET.get("src", "")
    data = requests.delete(
        "http://{}/webhdfs/v1{}?user.name={}&op=DELETE&&recursive=true".format(HADOOP_MASTER_ADDRESS, src,
                                                                               HADOOP_USERNAME)).text
    files_json = json.loads(data)
    return render(request, 'hfm/content.html', {'content': "ok"})


def upload_file(request):
    if request.method == 'POST':
        path = handle_uploaded_file(request.FILES['file_upload'], request.POST.get("file_name", ""))
        dest = request.POST.get("pwd", "") + request.POST.get("file_name", "")
        put(path, dest)
        return render(request, 'hfm/content.html', {'content': "ok"})
    else:
        return render(request, 'hfm/content.html', {'content': "error"})


def handle_uploaded_file(f, name):
    with open(os.path.join(MEDIA_ROOT, name), 'wb+') as destination:
        for chunk in f.chunks():
            destination.write(chunk)
    return os.path.join(MEDIA_ROOT, name)


def mkdir(request):
    src = request.GET.get("src", "")
    data = requests.put(
        "http://{}/webhdfs/v1{}?user.name={}&op=MKDIRS".format(HADOOP_MASTER_ADDRESS, src, HADOOP_USERNAME)).text
    files_json = json.loads(data)
    return render(request, 'hfm/content.html', {'content': "ok"})


def touch(request):
    src = request.GET.get("src", "")
    requests.put("http://{}/webhdfs/v1{}?user.name={}&op=CREATE".format(HADOOP_MASTER_ADDRESS, src, HADOOP_USERNAME))
    return render(request, 'hfm/content.html', {'content': "ok"})
