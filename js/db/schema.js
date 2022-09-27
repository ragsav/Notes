import {appSchema, tableSchema} from '@nozbe/watermelondb';

export const xpenserSchema = appSchema({
  version: 17,
  tables: [
    tableSchema({
      name: 'labels',
      columns: [
        {name: 'title', type: 'string'},
        {name: 'icon_string', type: 'string'},
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
        {name: 'is_archived', type: 'boolean', isOptional: true},
        {name: 'archive_timestamp', type: 'number', isOptional: true},
        {name: 'is_marked_deleted', type: 'boolean', isOptional: true},
        {name: 'marked_deleted_timestamp', type: 'number', isOptional: true},
      ],
    }),
    tableSchema({
      name: 'tasks',
      columns: [
        {name: 'title', type: 'string'},
        {name: 'description', type: 'string', isOptional: true},
        {name: 'note_id', type: 'string'},
        {name: 'is_bookmarked', type: 'boolean'},
        {name: 'is_done', type: 'boolean'},
        {name: 'done_timestamp', type: 'number', isOptional: true},
        {name: 'priority', type: 'number'},
        {name: 'start_timestamp', type: 'number', isOptional: true},
        {name: 'end_timestamp', type: 'number', isOptional: true},
        {name: 'reminder_timestamp', type: 'number', isOptional: true},
        {name: 'reminder_id', type: 'string', isOptional: true},
        {name: 'is_repeating', type: 'boolean', isOptional: true},
        {name: 'is_archived', type: 'boolean', isOptional: true},
        {name: 'archive_timestamp', type: 'number', isOptional: true},
        {name: 'is_marked_deleted', type: 'boolean', isOptional: true},
        {name: 'marked_deleted_timestamp', type: 'number', isOptional: true},
        {name: 'repeat_cron', type: 'string', isOptional: true},
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
      ],
    }),
    tableSchema({
      name: 'notes',
      columns: [
        {name: 'title', type: 'string'},
        {name: 'description', type: 'string', isOptional: true},
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
        {name: 'color_string', type: 'string', isOptional: true},
        {name: 'label_id', type: 'string'},
        {name: 'is_archived', type: 'boolean', isOptional: true},
        {name: 'archive_timestamp', type: 'number', isOptional: true},
        {name: 'is_marked_deleted', type: 'boolean', isOptional: true},
        {name: 'marked_deleted_timestamp', type: 'number', isOptional: true},
      ],
    }),
  ],
});
