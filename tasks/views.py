# from django.contrib.auth.decorators import login_required
from django.shortcuts import render

def home(request):
    return render(request, 'tasks/home.html')

def tugas(request):
    return render(request, 'tasks/tasks.html')

def matriks(request):
    return render(request, 'tasks/matrix.html')

def profil(request):
    return render(request, 'tasks/profile.html')