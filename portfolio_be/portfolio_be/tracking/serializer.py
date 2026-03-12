
from rest_framework import serializers
from .models import Visitor, PageView


class VisitorSerializer(serializers.ModelSerializer):
	class Meta:
		model = Visitor
		fields = ["id", "anon_id", "created_at", "last_seen"]
		read_only_fields = ["id", "created_at", "last_seen"]


class PageViewSerializer(serializers.ModelSerializer):
	# Accept an anon_id from client to link to a Visitor (write-only)
	anon_id = serializers.CharField(write_only=True, required=False, allow_blank=True)

	class Meta:
		model = PageView
		fields = [
			"id",
			"anon_id",
			"visitor",
			"ip_hash",
			"path",
			"method",
			"user_agent",
			"referrer",
			"timestamp",
			"consent",
			"meta",
		]
		read_only_fields = ["id", "visitor"]

	def create(self, validated_data):
		anon_id = validated_data.pop("anon_id", None)
		visitor = None
		if anon_id:
			visitor, _ = Visitor.objects.get_or_create(anon_id=anon_id)
		pv = PageView.objects.create(visitor=visitor, **validated_data)
		return pv

