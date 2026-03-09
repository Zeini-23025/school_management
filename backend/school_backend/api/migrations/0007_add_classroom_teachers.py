# Generated manually to add teachers relationship to Classroom

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_remove_subject_coefficient_subject_totalpoints'),
    ]

    operations = [
        migrations.AddField(
            model_name='classroom',
            name='teachers',
            field=models.ManyToManyField(related_name='classrooms', to='auth.User', blank=True),
        ),
    ]
