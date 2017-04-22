from django.core.management.base import BaseCommand, CommandError
from rest_service.models import Task as Task

from datetime import datetime, timedelta, timezone
import calendar



class Command(BaseCommand):
		help = 'Handles any overdue tasks ... Tsk tsk tsk'

		def handle(self, *args, **options):
			time = datetime.now(timezone.utc)
			print('TIME: ' + str(time))

			overdue = Task.objects.filter(deadline__lte=time)

			for ot in overdue:
				print('TYPE: ' + str(type(ot)))
				self.stdout.write(self.style.SUCCESS('Deleting task: {} -> {}'.format(ot.name, str(ot.deadline))))
				ot.delete()

