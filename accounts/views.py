from django.contrib.auth import authenticate, login as auth_login
from django.shortcuts import redirect, render

def register(request):
    return render(request, 'accounts/register.html')

def login(request):
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


