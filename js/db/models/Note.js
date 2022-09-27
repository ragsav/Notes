import {Model} from '@nozbe/watermelondb';
import {
  field,
  text,
  relation,
  children,
  writer,
  date,
  readonly,
  lazy,
} from '@nozbe/watermelondb/decorators';
export default class Note extends Model {
  static table = 'notes';
  static associations = {
    tasks: {type: 'has_many', foreignKey: 'note_id'},
    labels: {type: 'belongs_to', key: 'label_id'},
  };

  @text('title') title;
  @text('description') description;

  @text('color_string') colorString;
  @text('label_id') labelID;
  @field('is_archived') isArchived;
  @date('archive_timestamp') archiveTimestamp;
  @field('is_marked_deleted') isMarkedDeleted;
  @date('marked_deleted_timestamp') markedDeletedTimestamp;
  @readonly @date('created_at') createdAt;
  @readonly @date('updated_at') updatedAt;

  @children('tasks') tasks;
}
