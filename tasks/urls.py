from django.urls import path

from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('tugas/', views.tugas, name='tugas'),
    path('matriks/', views.matriks, name='matriks'),
    path('profil/', views.profil, name='profil'),
    path('logout/', views.logout, name='logout'),
    path('toggle_task/<int:task_id>/', views.toggle_task, name='toggle_task'),
    path('delete_task/<int:task_id>/', views.delete_task, name='delete_task'),
    path('edit_task/<int:task_id>/', views.edit_task, name='edit_task'),
]