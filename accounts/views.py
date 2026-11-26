from django.contrib.auth import authenticate, login as auth_login
from django.contrib.auth.models import User
from django.shortcuts import redirect, render

def register(request):
    # kalau user sudah login, redirect ke halaman home
    if request.user.is_authenticated:
        return redirect('home')
    
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        if username and password:
            user = User.objects.create_user(username=username, password=password)
            return redirect('login')
    return render(request, 'accounts/register.html')

def login(request):
    # kalau user sudah login, redirect ke halaman home
    if request.user.is_authenticated:
        return redirect('home')
    
    # kalau user belum login, proses login
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)
        if user is not None:
            auth_login(request, user)
            return redirect('home')  
        else:
            print("Invalid username or password.")
    return render(request, 'accounts/login.html')


