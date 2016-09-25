# HFX
It's a HDFS File Manager Written in Python and Django.

## How to Run ?
First of all install python, pip and django (Ubuntu):
```
sudo apt-get update
sudo apt-get install git
sudo apt-get install python3
sudo apt-get install python3-pip
sudo pip3 install django
```

Clone this Repo
```
git clone https://github.com/siyanew/HFX.git
cd HFX
```

Edit `HDFSM/settings.py ` and enter your configuration.
```
HADOOP_HOME = "/usr/local/hadoop/hadoop-2.7.2/bin/" # HADOOP SOURCE
HADOOP_USERNAME = "ENTER_HADOOP_USERNAME_"
HADOOP_PASSWORD = "ENTER_HADOOP_PASSWORD"
HADOOP_MASTER_ADDRESS = "localhost:50070" # HADOOP ADDRESS
```

After That Start it via :
```
python3 manage.py runserver 0.0.0.0:8000
```

## Safemode
If you can not make directory or file, turn off the safemode:
```
bin/hdfs dfsadmin -safemode leave
```
