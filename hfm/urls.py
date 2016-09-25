from django.conf.urls import url, include
from . import views

urlpatterns = [
    url(r'^$', views.ls, name='ls'),
    url(r'^ls/$', views.ls_address, name='ls_address'),
    url(r'^cat/$', views.cat, name='cat'),
    url(r'^upload$', views.upload_file, name='upload_file'),
    url(r'^rename$', views.rename, name='rename'),
    url(r'^copy$', views.copy, name='copy'),
    url(r'^delete$', views.delete_file, name='delete_file'),
    url(r'^mkdir$', views.mkdir, name='mkdir'),
    url(r'^touch$', views.touch, name='touch'),

]