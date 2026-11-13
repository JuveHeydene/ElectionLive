from circonscription.models import BureauDeVote, CentreDeVote
from users.enums import UserRole, Gender
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils.timezone import now
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    name = models.CharField(max_length=100)
    surname = models.CharField(max_length=100)
    gender = models.CharField(max_length=50, choices=Gender.choices,default=Gender.MALE)
    political_party = models.CharField(max_length=100, null=True, blank=True)
    userimage = models.CharField(max_length=100, null=True, blank=True)
    tel = models.CharField(max_length=15, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100,null=True, blank=True)
    birthdate = models.DateField()
    role = models.CharField(max_length=50, choices=UserRole.choices)
    bureau_de_vote = models.ForeignKey(
        BureauDeVote, on_delete=models.CASCADE, related_name="users", null=True, blank=True
    )
    centre_de_vote = models.ForeignKey(
        CentreDeVote, on_delete=models.SET_NULL, related_name="users", null=True, blank=True
    )
    created_by = models.ForeignKey(
        'self', on_delete=models.SET_NULL, related_name='created_users', null=True, blank=True
    )

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    # Définit le champ utilisé pour l'authentification
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'surname']  # Champs requis pour créer un superuser

    objects = UserManager()

    def __str__(self):
        return f"{self.name} {self.surname} ({self.email})"



    
    


class ResultatDeVote(models.Model):
    id = models.AutoField(primary_key=True)
    total_votes = models.PositiveIntegerField()  # Total des votes
    candidat = models.ForeignKey(
        'User',  # Lien avec la classe User (un utilisateur a plusieurs résultats de vote)
        on_delete=models.CASCADE,
        related_name='resultats_de_vote'  # Un utilisateur peut avoir plusieurs résultats
    )
    bureau_de_vote = models.ForeignKey(
        BureauDeVote,  # Lien avec le bureau de vote
        on_delete=models.CASCADE,
        related_name='resultats_de_vote'  # Un bureau de vote peut avoir plusieurs résultats
    )
    created_at = models.DateTimeField(default=now, editable=False) 
    
    def __str__(self):
        return f"Résultat pour {self.user.name} {self.user.surname} au bureau {self.bureau_de_vote.name} : {self.total_votes} votes"
