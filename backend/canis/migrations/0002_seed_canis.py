from django.db import migrations


def criar_canis(apps, schema_editor):
    Canil = apps.get_model("canis", "Canil")

    for numero in range(1, 16):
        Canil.objects.get_or_create(
            numero=numero,
            defaults={"ativo": True}
        )


class Migration(migrations.Migration):

    dependencies = [
        ("canis", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(
            criar_canis,
            reverse_code=migrations.RunPython.noop
        ),
    ]
