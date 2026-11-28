from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout as auth_logout
from django.shortcuts import render, redirect
from django.contrib.auth.models import User


from .models import UserProfile, Task
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta

def logout(request):
    auth_logout(request)
    return redirect('login')

@login_required
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
    next_url = request.GET.get('next') or 'home'
    return redirect(next_url)

def delete_task(request, task_id):
    task = get_object_or_404(Task, id=task_id)
    if task.is_done:
        profile, created = UserProfile.objects.get_or_create(user=task.user)
        profile.xp = max(0, profile.xp - 10)
        profile.save()
    task.delete()
    next_url = request.GET.get('next') or 'home'
    return redirect(next_url)

@login_required
def tugas(request):

    user = request.user

    if request.method == 'POST':
        title = request.POST.get('title')
        note = request.POST.get('note', '')
        due_date = request.POST.get('due_date') or None
        is_urgent = bool(request.POST.get('is_urgent')) #ambil setatus dari checkbox is_urgent, jika dicentang maka bernilai True, jika tidak dicentang maka bernilai False
        is_important = bool(request.POST.get('is_important')) #ambil setatus dari checkbox is_important, jika dicentang maka bernilai True, jika tidak dicentang maka bernilai False

        if title:
            Task.objects.create(
                user=user,
                title=title,
                is_urgent=is_urgent,
                is_important=is_important,
                note=note,
                due_date=due_date
            )
            return redirect('tugas')

    tasks = Task.objects.filter(user=user).order_by('due_date', '-created_at')

    today = timezone.localdate()

    yesterday = today - timedelta(days=1)

    nama_hari = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]
    nama_bulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]

    group_tasks = []
    grouped_map = {}

    for task in tasks:
        due_date = task.due_date

        if hasattr(due_date, 'date'):
            due_date = timezone.localtime(due_date.date())

        if due_date not in grouped_map:
            is_today = False

            if due_date is None:
                label = "Tidak Ada Tanggal"
            elif due_date == today:
                label = "Hari Ini"
                is_today = True
            elif due_date == yesterday:
                label = "Kemarin"
            else:
                hari = nama_hari[due_date.weekday()]
                bulan = nama_bulan[due_date.month -1]
                label = f"{hari}, {due_date.day} {bulan}"

            group = {
            'label': label,
            'is_today': is_today,
            'tasks': [],
            }

            grouped_map[due_date] = group
            group_tasks.append(group)

        grouped_map[due_date]['tasks'].append(task)

    return render(request, 'tasks/tasks.html', context={'group_tasks': group_tasks})

def edit_task(request, task_id):
    task = get_object_or_404(Task, id=task_id)

    if request.method == 'POST':
        title = request.POST.get('title')
        note = request.POST.get('note', '')
        due_date = request.POST.get('due_date') or None
        is_urgent = bool(request.POST.get('is_urgent'))
        is_important = bool(request.POST.get('is_important'))

        if title:
            task.title = title
            task.note = note
            task.due_date = due_date
            task.is_urgent = is_urgent
            task.is_important = is_important
            task.save()
            return redirect('tugas')

    context = {
        'task': task,
    }
    return render(request, 'tasks/edit_task.html', context)

def matriks(request):
    return render(request, 'tasks/matrix.html')

def profil(request):
    return render(request, 'tasks/profile.html')