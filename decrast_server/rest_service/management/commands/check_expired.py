from django.utils import timezone

from django.core.management.base import BaseCommand, CommandError
from rest_service.models import Task as Task
from rest_service.notifications import *

from datetime import datetime, timedelta, timezone
import calendar



class Command(BaseCommand):
		help = 'Handles any overdue tasks ... Tsk tsk tsk'

		def handle(self, *args, **options):
			time = datetime.now(timezone.utc)
			self.stdout.write(self.style.SUCCESS('TIME: ' + str(time)))

#			overdue = Task.objects.filter(deadline__lte=time)

			overdue = Task.objects.all()

			for ot in overdue:
				print('TYPE: ' + ot.name)
				print("LEN: " + str(len(ot.viewers.all())))
				self.stdout.write(self.style.SUCCESS('Deleting task: {} -> {}'.format(ot.name, str(ot.deadline))))
#				task_expired_notification(ot.owner, ot)
				ot.delete()

