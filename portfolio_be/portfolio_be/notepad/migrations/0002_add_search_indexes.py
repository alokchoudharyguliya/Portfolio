# Generated migration to add search/filter indexes

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('notepad', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='drawing',
            name='title',
            field=models.CharField(blank=True, db_index=True, default='Untitled', max_length=200),
        ),
        migrations.RunSQL(
            # Enable trigram extension for fuzzy search (PostgreSQL only)
            'CREATE EXTENSION IF NOT EXISTS pg_trgm;',
            'DROP EXTENSION IF EXISTS pg_trgm;',
            state_operations=[],
        ),
        migrations.RunSQL(
            # Create GIN index on title using trigram for fuzzy/partial matches
            'CREATE INDEX notepad_drawing_title_trgm_idx ON notepad_drawing USING GIN (title gin_trgm_ops);',
            'DROP INDEX IF EXISTS notepad_drawing_title_trgm_idx;',
            state_operations=[],
        ),
    ]
