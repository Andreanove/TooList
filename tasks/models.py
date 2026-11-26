from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    xp = models.IntegerField(default=0)

    @property
    def level(self):
        return (self.xp // 50) + 1

    @property
    def sisa_xp(self):
        return 50 - (self.xp % 50)

    @property
    def progress_bar(self):
        return (self.xp % 50) * 2

    def __str__(self):
        return f"{self.user.username} - Level: {self.level}, XP: {self.xp}"


class Task(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=80)
    is_done = models.BooleanField(default=False)
    is_urgent = models.BooleanField(default=False)
    is_important = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title