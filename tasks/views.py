# from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.shortcuts import redirect
from django.contrib.auth.models import User
from .models import UserProfile, Task
from django.shortcuts import get_object_or_404

def home(request):
    
    user = User.objects.first()

    profile, created = UserProfile.objects.get_or_create(user=user)

    if request.method == 'POST':
        title = request.POST.get('title')
    
        if title :
            task = Task.objects.create(user=user, title=title)
            return redirect('home')

    task = Task.objects.filter(user=user).order_by('-created_at')
    done_count = task.filter(is_done=True).count()

    context = {
        'profile': profile,
        'tasks': task,
        'done_count': done_count,
    }
    return render(request, 'tasks/home.html', context)

def toggle_task(request, task_id):
    task = get_object_or_404(Task, id=task_id)
    profile, created = UserProfile.objects.get_or_create(user=task.user)
    task.is_done = not task.is_done
    task.save()

    if task.is_done:
        profile.xp += 10
    else:
        profile.xp = max(0, profile.xp - 10)
    profile.save()
    return redirect('home')

def delete_task(request, task_id):
    task = get_object_or_404(Task, id=task_id)
    if task.is_done:
        profile, created = UserProfile.objects.get_or_create(user=task.user)
        profile.xp = max(0, profile.xp - 10)
    profile.save()
    task.delete()
    return redirect('home')

def tugas(request):
    return render(request, 'tasks/tasks.html')

def matriks(request):
    return render(request, 'tasks/matrix.html')

def profil(request):
    return render(request, 'tasks/profile.html')