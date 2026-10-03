from django.contrib.auth import get_user_model
from rest_framework import serializers


Usuario = get_user_model()


class RegistroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    class Meta:
        model = Usuario
        fields = [
            "id",
            "username",
            "email",
            "password",
        ]

    def create(self, validated_data):
        password = validated_data.pop("password")

        usuario = Usuario(
            **validated_data
        )

        usuario.set_password(password)
        usuario.save()

        return usuario


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = [
            "id",
            "username",
            "email",
            "rol",
        ]