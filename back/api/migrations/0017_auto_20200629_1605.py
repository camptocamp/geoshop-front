# Generated by Django 3.0.5 on 2020-06-29 14:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0016_auto_20200629_1515'),
    ]

    operations = [
        migrations.AlterField(
            model_name='pricing',
            name='name',
            field=models.CharField(blank=True, default='pricing_name', max_length=100, null=True, verbose_name='name'),
        ),
    ]
