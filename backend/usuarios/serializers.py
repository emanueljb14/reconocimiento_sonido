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
    password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=False,
        min_length=8,
    )

    class Meta:
        model = Usuario
        fields = [
            "id",
            "username",
            "email",
            "password",
            "rol",
            "is_active",
            "date_joined",
            "last_login",
        ]

        read_only_fields = [
            "id",
            "date_joined",
            "last_login",
        ]

    def create(self, validated_data):
        password = validated_data.pop("password")

        usuario = Usuario(
            **validated_data
        )

        usuario.set_password(password)
        usuario.save()

        return usuario

    def update(self, instance, validated_data):
        password = validated_data.pop(
            "password",
            None,
        )

        for campo, valor in validated_data.items():
            setattr(
                instance,
                campo,
                valor,
            )

        if password:
            instance.set_password(password)

        instance.save()

        return instance
