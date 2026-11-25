from django.urls import path

from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('tugas/', views.tugas, name='tugas'),
    path('matriks/', views.matriks, name='matriks'),
    path('profil/', views.profil, name='profil'),
]