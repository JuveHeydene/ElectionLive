from django.core.exceptions import ValidationError

def validate_pdf(value):
    if not value.name.endswith('.pdf'):
        raise ValidationError("Seuls les fichiers PDF sont autorisés.")
