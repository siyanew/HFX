$(document).ready(function () { //this makes sure the dom is loaded
    $("html").niceScroll();
    Materialize.updateTextFields();
    var file_action = {};


    $('.upload_modal_trigger').leanModal({
            dismissible: false, // Modal can be dismissed by clicking outside of the modal
        }
    );

    $(document).on("click", "a.directory", function (event) {
        event.preventDefault(); //prevent the default action
        var dir_src = $(this).attr("data-src");
        $('#lstable').hide()
        ajax_req = $.ajax({
            url: "/ls/",
            type: "GET",
            data: {src: dir_src},
            success: function (content) {
                $('#lstable').html(content);
                $('#lstable').fadeIn(300);
                reload_component();
            }
        });
    });

    $(document).on("click", "a.file", function (event) {
        event.preventDefault(); //prevent the default action
        var dir_src = $(this).attr("data-src");
        $('.reader_title').html($(this).text());
        $('.loading-linear').show();
        ajax_req = $.ajax({
            url: "/cat/",
            type: "GET",
            data: {src: dir_src},
            success: function (content) {
                var content_wb = content.replace(/\n/g, "<br/>");
                $('.reader_body').html(content_wb);
                $('.loading-linear').hide();
                $('#reader_modal').openModal();
            }
        });
    });

    $(document).on("click", "a.reader_modal_close", function (event) {
        event.preventDefault(); //prevent the default action
        var dir_src = $(this).attr("data-src");
        $('.reader_title').html("");
        $('.reader_body').html("");
        $('#reader_modal').closeModal();

    });

    $(document).on("click", "a.upload_modal_trigger", function (event) {
        event.preventDefault(); //prevent the default action
        var dest = $('.pwd').attr("data-src");
        $('.upload_pwd').val(dest);
        $('.upload_dir').html('<i class="fa fa-map-marker"></i>' + dest);
        $('#upload_modal').openModal();

    });

    function refreshls(pwd) {
        $('#lstable').hide()
        ajax_req = $.ajax({
            url: "/ls/",
            type: "GET",
            data: {src: pwd},
            success: function (content) {
                $('#lstable').html(content);
                $('#lstable').fadeIn(300);
                reload_component();
            }
        });
    }

    $(document).on("click", "a.refreshls", function (event) {
        event.preventDefault(); //prevent the default action
        var pwd = $('.pwd').attr("data-src");
        refreshls(pwd)
    });

    $(document).on("click", "a.cd", function (event) {
        event.preventDefault(); //prevent the default action
        var pwd = $('.wd').val();
        refreshls(pwd)
    });

    $(document).on("click", "a.upload", function (event) {
        event.preventDefault(); //prevent the default action
        $('.loading-linear-upload').show();
        var formData = new FormData($('#upload_form')[0]);
        $('.close_upload').removeClass("modal-action")
        $('.close_upload').removeClass("modal-close")
        $('.close_upload').addClass("disabled")
        var pwd = $('.pwd').attr("data-src");
        $.ajax({
            url: '/upload',
            type: 'POST',
            data: formData,
            async: false,
            success: function (data) {
                $('.loading-linear-upload').hide();
                if (data == "ok") {
                    Materialize.toast('The File Uploaded Successfully.', 4000)
                    $('#upload_modal').closeModal();
                    $('.close_upload').addClass("modal-action")
                    $('.close_upload').addClass("modal-close")
                    $('.close_upload').removeClass("disabled")
                    refreshls(pwd)
                }
                $('#file_reset').trigger('click');
            },
            cache: false,
            contentType: false,
            processData: false
        });

        return false;
    });

    $(document).on("click", "a.rename", function (event) {
        event.preventDefault(); //prevent the default action
        var pwd = $('.pwd').attr("data-src");
        var file_name = $(this).attr('data-name');
        swal({
                title: "Rename",
                text: "New Name:",
                type: "input",
                showCancelButton: true,
                closeOnConfirm: false,
                animation: "slide-from-top",
                inputPlaceholder: file_name,
                inputValue: file_name,
                showLoaderOnConfirm: true,
            },
            function (inputValue) {
                if (inputValue === false) return false;

                if (inputValue === "") {
                    swal.showInputError("You need to write something!");
                    return false
                }
                ajax_req = $.ajax({
                    url: "/rename",
                    type: "GET",
                    data: {src: pwd + file_name, dest: pwd + inputValue},
                    success: function (content) {
                        Materialize.toast('The name of the file changed successfully!', 4000);
                        refreshls(pwd);
                    }
                });

            });

    });

    $(document).on("click", "a.delete_file", function (event) {
        event.preventDefault(); //prevent the default action
        var pwd = $('.pwd').attr("data-src");
        var file_address = $(this).attr('data-src');
        swal({
                title: "Are You Sure ?",
                text: "Do You Want To Remove " + file_address,
                showCancelButton: true,
                closeOnConfirm: false,
                animation: "slide-from-top",
                showLoaderOnConfirm: true,
                confirmButtonText: "Yes, delete it!",
            },
            function () {
                ajax_req = $.ajax({
                    url: "/delete",
                    type: "GET",
                    data: {src: file_address},
                    success: function (content) {
                        swal("Done!", "The File Deleted!", "success");
                        Materialize.toast('The File Deleted!', 4000);
                        refreshls(pwd)
                    }
                });

            });

    });

    $(document).on("click", "a.mkdir", function (event) {
        event.preventDefault(); //prevent the default action
        var pwd = $('.pwd').attr("data-src");
        var file_name = $(this).attr('data-name');
        swal({
                title: "Make A New Directory",
                text: "New Name:",
                type: "input",
                showCancelButton: true,
                closeOnConfirm: false,
                animation: "slide-from-top",
                inputPlaceholder: file_name,
                inputValue: file_name,
                showLoaderOnConfirm: true,
            },
            function (inputValue) {
                if (inputValue === false) return false;

                if (inputValue === "") {
                    swal.showInputError("You need to write something!");
                    return false
                }
                ajax_req = $.ajax({
                    url: "/mkdir",
                    type: "GET",
                    data: {src: pwd + inputValue},
                    success: function (content) {
                        Materialize.toast('The Directory Created Successfully!', 4000);
                        refreshls(pwd);
                        swal.close();
                    }
                });

            });

    });


    $(document).on("click", "a.touch", function (event) {
        event.preventDefault(); //prevent the default action
        var pwd = $('.pwd').attr("data-src");
        var file_name = $(this).attr('data-name');
        swal({
                title: "Create New File",
                text: "New File:",
                type: "input",
                showCancelButton: true,
                closeOnConfirm: false,
                animation: "slide-from-top",
                inputPlaceholder: file_name,
                inputValue: file_name,
                showLoaderOnConfirm: true,
            },
            function (inputValue) {
                if (inputValue === false) return false;

                if (inputValue === "") {
                    swal.showInputError("You need to write something!");
                    return false
                }
                ajax_req = $.ajax({
                    url: "/touch",
                    type: "GET",
                    data: {src: pwd + inputValue},
                    success: function (content) {

                        Materialize.toast('The File Created Successfully!', 4000);
                        refreshls(pwd)
                        swal.close();
                    }
                });

            });

    });

    $(document).on("click", "a.cut_all", function (event) {
        event.preventDefault(); //prevent the default action
        file_action = {};
        file_action['action'] = 'cut';
        file_action['files'] = [];
        $('.check_box:checked').each(function () {
            file_action['files'].push($(this).attr('data-src'))
        })
        if(file_action['files'].length > 0){
            Materialize.toast('The Files Are Ready To Paste!', 4000);
        }else {
            Materialize.toast('Select Some Files First!', 4000);
        }

    });

    $(document).on("click", "a.copy_all", function (event) {
        event.preventDefault(); //prevent the default action
        file_action = {};
        file_action['action'] = 'copy';
        file_action['files'] = [];
        $('.check_box:checked').each(function () {
            file_action['files'].push($(this).attr('data-src'))
        })
        if(file_action['files'].length > 0){
            Materialize.toast('The Files Are Ready To Paste!', 4000);
        }else {
            Materialize.toast('Select Some Files First!', 4000);
        }

    });

    $(document).on("click", "a.paste_all", function (event) {
        event.preventDefault(); //prevent the default action
        if(file_action == null || file_action['files'] == null||file_action['files'].length == 0){
            Materialize.toast("You Didn't Select Any Files!", 4000);
            return;
        }
        var pwd = $('.pwd').attr("data-src");
        if (file_action['action'] == 'cut') {
            file_action['files'].forEach(function (item, index, arr) {
                $.ajax({
                    url: "/rename",
                    type: "GET",
                    data: {src: item, dest: pwd},
                    success: function (content) {

                    }
                });
            });
            Materialize.toast("Files Moved Successfully!", 4000);
            refreshls(pwd)
            file_action = {}
        }
        if (file_action['action'] == 'copy') {
            file_action['files'].forEach(function (item, index, arr) {
                $.ajax({
                    url: "/copy",
                    type: "GET",
                    data: {src: item, dest: pwd},
                    success: function (content) {

                    }
                });
            });
            Materialize.toast("Files Moved Successfully!", 4000);
            refreshls(pwd)
        }
    });

    $(document).on("click", "a.delete_all", function (event) {
        event.preventDefault(); //prevent the default action
        var pwd = $('.pwd').attr("data-src");
        file_action = {};
        file_action['files'] = [];
        $('.check_box:checked').each(function () {
            file_action['files'].push($(this).attr('data-src'))
        })
        if(file_action['files'].length == 0){
            Materialize.toast("You Didn't Select Any Files!", 4000);
            return;
        }
        swal({
                title: "Are You Sure ?",
                text: "Do You Want To Remove Selected Files ",
                showCancelButton: true,
                closeOnConfirm: false,
                animation: "slide-from-top",
                confirmButtonText: "Yes, delete them!",
            },
            function () {
                delete_all();
                Materialize.toast("The Files Deleted!", 4000);
                refreshls(pwd);
                file_action = {};
                swal.close();
            });
    });

    function delete_all() {
        file_action['files'].forEach(function (item, index, arr) {
            ajax_req = $.ajax({
                url: "/delete",
                type: "GET",
                data: {src: item},
                success: function (content) {

                }
            });
        });

    }


    $(window).bind('dragover', dragover);
    $(window).bind('drop', drop);
    $('#dragandrophandler').bind('dragleave', dragleave);
    var tid;

    function dragover(event) {
        clearTimeout(tid);
        event.stopPropagation();
        event.preventDefault();
        $('#dragandrophandler').fadeIn(300);

    }

    function dragleave(event) {
        tid = setTimeout(function () {
            event.stopPropagation();
            $('#dragandrophandler').fadeOut(300);
        }, 300);
    }

    function drop(event) {
        //readfiles(event.originalEvent.dataTransfer.files);
        event.stopPropagation();
        event.preventDefault();
        //$('#dragandrophandler').fadeOut(300);
        var files = event.originalEvent.dataTransfer.files;
        $('#dragandrophandler').fadeOut(300);
        handleFileUpload(files, $('#dragandrophandler'));
    }


    function reload_component() {
        $('.tooltipped').tooltip({delay: 50});
        Materialize.updateTextFields();
    }

    function createStatusbar(obj) {
        this.statusbar = $('<div id="status" class="row"></div>');
        this.filename = $("<div class='col s3 filename'></div>").appendTo(this.statusbar);
        this.size = $("<div class='col s2 filesize'></div>").appendTo(this.statusbar);
        this.progressBar = $('<div class="col s6 progress"><div class="determinate"></div></div>').appendTo(this.statusbar);
        this.abort = $('<div class="col s1" ><a class="waves-effect waves-light btn abort red"><i class="fa fa-times"></i></a></div>').appendTo(this.statusbar);
        $('.container').prepend(this.statusbar);


        this.setFileNameSize = function (name, size) {
            var sizeStr = "";
            var sizeKB = size / 1024;
            if (parseInt(sizeKB) > 1024) {
                var sizeMB = sizeKB / 1024;
                sizeStr = sizeMB.toFixed(2) + " MB";
            }
            else {
                sizeStr = sizeKB.toFixed(2) + " KB";
            }

            this.filename.html('<i class="fa fa-file-o"></i></a> ' + name);
            this.size.html('<i class="fa fa-hdd-o"></i></a> ' + sizeStr);
        }
        this.setProgress = function (progress) {
            var progressBarWidth = progress * this.progressBar.width() / 100;
            this.progressBar.find('.determinate').width(progress + "%");
            if (parseInt(progress) >= 100) {
                this.abort.hide();
                this.statusbar.fadeOut(300);
                Materialize.toast(name + " Uploaded Successfully!", 4000);
                Materialize.toast("Please Wait, The File is Copying into nodes!", 4000);
            }
        }
        this.setAbort = function (jqxhr) {
            var sb = this.statusbar;
            this.abort.click(function () {
                jqxhr.abort();
                sb.hide();
            });
        }
    }


    function handleFileUpload(files, obj) {
        for (var i = 0; i < files.length; i++) {
            var fd = new FormData();
            fd.append('file_upload', files[i]);
            fd.append('file_name', files[i].name);
            fd.append("csrfmiddlewaretoken", $('input[name=csrfmiddlewaretoken]').val())
            fd.append("pwd", $('.pwd').attr("data-src"))
            var status = new createStatusbar(obj); //Using this we can set progress.
            status.setFileNameSize(files[i].name, files[i].size);
            sendFileToServer(fd, status);

        }
    }

    function sendFileToServer(formData, status) {
        //makeCorsRequest();
        var uploadURL = "/upload"; //Upload URL
        var extraData = {}; //Extra Data.
        var jqXHR = $.ajax({
            xhr: function () {
                var xhrobj = $.ajaxSettings.xhr();
                if (xhrobj.upload) {
                    xhrobj.upload.addEventListener('progress', function (event) {
                        var percent = 0;
                        var position = event.loaded || event.position;
                        var total = event.total;
                        if (event.lengthComputable) {
                            percent = Math.ceil(position / total * 100);
                        }
                        //Set progress
                        status.setProgress(percent);
                    }, false);
                }
                return xhrobj;
            },
            url: uploadURL,
            type: "POST",
            contentType: false,
            processData: false,
            cache: false,
            data: formData,
            ContentType: "application/json",

            success: function (data) {
                status.setProgress(100);

                //$("#status1").append("File upload Done<br>");
            }
        });

        status.setAbort(jqXHR);

    }


});
