import {Q} from '@nozbe/watermelondb';
import 'react-native-get-random-values';
import {database} from '../../db/db';
import Task from '../../db/models/Task';
import NotificationService from '../../services/notifications';
import {Logger} from '../../utils/logger';

export const GET_TASKS = 'GET_TASKS';
export const CREATE_TASK_STATE = 'CREATE_TASK_STATE';
export const EDIT_TASK_STATE = 'EDIT_TASK_STATE';
export const DELETE_TASK_STATE = 'DELETE_TASK_STATE';
export const DELETE_MULTIPLE_TASK_STATE = 'DELETE_MULTIPLE_TASK_STATE';

export const getTasksState = ({loading, error, tasks}) => {
  return {
    type: GET_TASKS,
    state: {
      loading,
      tasks,
      error,
    },
  };
};

export const createTaskState = ({loading, success, error}) => {
  return {
    type: CREATE_TASK_STATE,
    state: {loading, success, error},
  };
};
export const resetCreateTaskState = () => {
  return {
    type: CREATE_TASK_STATE,
    state: {loading: false, success: false, error: null},
  };
};

export const editTaskState = ({loading, success, error}) => {
  return {
    type: EDIT_TASK_STATE,
    state: {loading, success, error},
  };
};
export const resetEditTaskState = () => {
  return {
    type: EDIT_TASK_STATE,
    state: {loading: false, success: false, error: null},
  };
};

export const deleteTaskState = ({loading, success, error}) => {
  return {
    type: DELETE_TASK_STATE,
    state: {loading, success, error},
  };
};

export const resetDeleteTaskState = () => {
  return {
    type: DELETE_TASK_STATE,
    state: {loading: false, success: false, error: null},
  };
};

export const deleteMultipleTasksState = ({loading, success, error}) => {
  return {
    type: DELETE_MULTIPLE_TASK_STATE,
    state: {loading, success, error},
  };
};

export const resetDeleteMultipleTasksState = () => {
  return {
    type: DELETE_MULTIPLE_TASK_STATE,
    state: {loading: false, success: false, error: null},
  };
};

export const getTasks = () => async dispatch => {
  dispatch(
    getTasksState({
      loading: true,
      error: null,
      tasks: null,
    }),
  );
  try {
    const tasks = await database.get('tasks').query().fetch();

    dispatch(
      getTasksState({
        loading: false,
        error: null,
        tasks,
      }),
    );
  } catch (error) {
    dispatch(
      getTasksState({
        loading: false,
        tasks: null,
        error,
      }),
    );
  }
};

/**
 *
 * @param {string} id
 * @returns {Promise<Task>}
 */
export const getTaskByID = async id => {
  try {
    const task = await database.get('tasks').find(id);
    Logger.pageLogger('task.js:getTaskByID:task', {task});
    return task;
  } catch (error) {
    Logger.pageLogger('task.js:getTaskByID:catch', {error});
    return null;
  }
};

/**
 *
 * @param {string} id
 * @returns {Promise<Array<Task>>}
 */
export const getTaskByQuery = async query => {
  try {
    const task = await database.collections
      .get('tasks')
      .query(Q.where('title', Q.like(`%${Q.sanitizeLikeString(query)}%`)))
      .fetch();
    Logger.pageLogger('task.js:getTaskByQuery:task', {task});
    return task;
  } catch (error) {
    Logger.pageLogger('task.js:getTaskByQuery:catch', {error});
    return null;
  }
};

export const createTask =
  ({
    title,
    noteID,
    startTimestamp,
    endTimestamp,
    reminderTimestamp,
    isRepeating,
  }) =>
  async dispatch => {
    dispatch(createTaskState({loading: true, success: false, error: null}));
    try {
      Logger.pageLogger('task.js:createTask:start');
      database.write(async () => {
        await database.get('tasks').create(task => {
          task.title = title;
          task.noteID = noteID;
          task.isBookmarked = false;
          task.isDone = false;
          task.priority = Date.now();
          task.startTimestamp = startTimestamp;
          task.endTimestamp = endTimestamp;
          task.reminderTimestamp = reminderTimestamp;
          task.isRepeating = isRepeating;
        });
      });

      dispatch(createTaskState({loading: false, success: true, error: null}));
      dispatch(getTasks());
      Logger.pageLogger('task.js:createTask:success');
    } catch (error) {
      Logger.pageLogger('task.js:createTask:catch', {error});
      dispatch(createTaskState({loading: false, success: true, error}));
    }
  };

export const editTask =
  ({
    id,
    title,
    noteID,
    priority,
    startTimestamp,
    endTimestamp,
    reminderTimestamp,
    isRepeating,
    isBookmarked,
    isDone,
  }) =>
  async dispatch => {
    dispatch(editTaskState({loading: true, success: false, error: null}));
    try {
      const taskToBeUpdated = await database.get('tasks').find(id);
      Logger.pageLogger('task.js:editTask:taskToBeUpdated', {taskToBeUpdated});
      database.write(async () => {
        await taskToBeUpdated.update(task => {
          task.title = title;
          task.noteID = noteID;
          task.isBookmarked = isBookmarked;
          task.isDone = isDone;
          task.priority = priority;
          task.startTimestamp = startTimestamp;
          task.endTimestamp = endTimestamp;
          task.reminderTimestamp = reminderTimestamp;
          task.isRepeating = isRepeating;
        });
      });

      dispatch(editTaskState({loading: false, success: true, error: null}));

      dispatch(getTasks());
      Logger.pageLogger('task.js:editTask:success');
    } catch (error) {
      Logger.pageLogger('task.js:editTask:catch', {error});
      dispatch(editTaskState({loading: false, success: true, error}));
    }
  };

export const editTaskMarkBulkDone =
  ({ids}) =>
  async dispatch => {
    if (Array.isArray(ids) && ids.length > 0) {
      dispatch(editTaskState({loading: true, success: false, error: null}));
      try {
        const _d = Date.now();
        const taskToBeUpdated = await database
          .get('tasks')
          .query(Q.where('id', Q.oneOf(ids)))
          .fetch();
        Logger.pageLogger('task.js:editTaskMarkBulkDone:taskToBeUpdated', {
          taskToBeUpdated,
        });
        const batchUpdateRecords = taskToBeUpdated.map(task => {
          return task.prepareUpdate(t => {
            t.isDone = true;
            task.doneTimestamp = _d;
          });
        });
        database.write(async () => {
          database.batch(...batchUpdateRecords);
        });

        dispatch(editTaskState({loading: false, success: true, error: null}));
        Logger.pageLogger('task.js:editTaskMarkBulkDone:suucess');
      } catch (error) {
        Logger.pageLogger('task.js:editTaskMarkBulkDone:catch', {error});
        dispatch(editTaskState({loading: false, success: true, error}));
      }
    }
  };

export const editTaskBookmarkBulk =
  ({ids}) =>
  async dispatch => {
    if (Array.isArray(ids) && ids.length > 0) {
      dispatch(editTaskState({loading: true, success: false, error: null}));
      try {
        const taskToBeUpdated = await database
          .get('tasks')
          .query(Q.where('id', Q.oneOf(ids)))
          .fetch();
        Logger.pageLogger('task.js:editTaskBookmarkBulk:taskToBeUpdated', {
          taskToBeUpdated,
        });
        const batchUpdateRecords = taskToBeUpdated.map(task => {
          return task.prepareUpdate(t => {
            t.isBookmarked = false;
          });
        });
        database.write(async () => {
          database.batch(...batchUpdateRecords);
        });

        dispatch(editTaskState({loading: false, success: true, error: null}));
        Logger.pageLogger('task.js:editTaskBookmarkBulk:success');
      } catch (error) {
        Logger.pageLogger('task.js:editTaskBookmarkBulk:catch', {error});
        dispatch(editTaskState({loading: false, success: true, error}));
      }
    }
  };
export const editTaskMarkBulkNotDone =
  ({ids}) =>
  async dispatch => {
    if (Array.isArray(ids) && ids.length > 0) {
      dispatch(editTaskState({loading: true, success: false, error: null}));
      try {
        const taskToBeUpdated = await database
          .get('tasks')
          .query(Q.where('id', Q.oneOf(ids)))
          .fetch();
        Logger.pageLogger('task.js:editTaskMarkBulkNotDone:taskToBeUpdated', {
          taskToBeUpdated,
        });
        const batchUpdateRecords = taskToBeUpdated.map(task => {
          return task.prepareUpdate(t => {
            t.isDone = false;
          });
        });
        database.write(async () => {
          database.batch(...batchUpdateRecords);
        });

        dispatch(editTaskState({loading: false, success: true, error: null}));
        Logger.pageLogger('task.js:editTaskMarkBulkNotDone:success');
      } catch (error) {
        Logger.pageLogger('task.js:editTaskMarkBulkNotDone:catch', {error});
        dispatch(editTaskState({loading: false, success: true, error}));
      }
    }
  };
export const editTaskTitle =
  ({id, title}) =>
  async dispatch => {
    dispatch(editTaskState({loading: true, success: false, error: null}));
    try {
      const taskToBeUpdated = await database.get('tasks').find(id);
      Logger.pageLogger('task.js:editTaskTitle:taskToBeUpdated', {
        taskToBeUpdated,
      });
      database.write(async () => {
        await taskToBeUpdated.update(task => {
          task.title = title;
        });
      });

      dispatch(editTaskState({loading: false, success: true, error: null}));

      dispatch(getTasks());
      Logger.pageLogger('task.js:editTaskTitle:success');
    } catch (error) {
      Logger.pageLogger('task.js:editTaskTitle:catch', {error});
      dispatch(editTaskState({loading: false, success: true, error}));
    }
  };
export const editTaskDescription =
  ({id, description}) =>
  async dispatch => {
    dispatch(editTaskState({loading: true, success: false, error: null}));
    try {
      const taskToBeUpdated = await database.get('tasks').find(id);
      Logger.pageLogger('task.js:editTaskDescription:taskToBeUpdated', {
        taskToBeUpdated,
      });
      database.write(async () => {
        await taskToBeUpdated.update(task => {
          task.description = description;
        });
      });

      dispatch(editTaskState({loading: false, success: true, error: null}));

      dispatch(getTasks());
      Logger.pageLogger('task.js:editTaskDescription:success');
    } catch (error) {
      Logger.pageLogger('task.js:editTaskDescription:catch', {error});
      dispatch(editTaskState({loading: false, success: true, error}));
    }
  };
export const editTaskPriority =
  ({id, priority}) =>
  async dispatch => {
    dispatch(editTaskState({loading: true, success: false, error: null}));
    try {
      const taskToBeUpdated = await database.get('tasks').find(id);
      Logger.pageLogger('task.js:editTaskPriority:taskToBeUpdated', {
        taskToBeUpdated,
      });
      database.write(async () => {
        await taskToBeUpdated.update(task => {
          task.priority = priority;
        });
      });

      dispatch(editTaskState({loading: false, success: true, error: null}));

      dispatch(getTasks());
      Logger.pageLogger('task.js:editTaskPriority:success');
    } catch (error) {
      Logger.pageLogger('task.js:editTaskPriority:catch', {error});
      dispatch(editTaskState({loading: false, success: true, error}));
    }
  };
export const editTaskIsDone =
  ({id, isDone}) =>
  async dispatch => {
    dispatch(editTaskState({loading: true, success: false, error: null}));
    try {
      const taskToBeUpdated = await database.get('tasks').find(id);
      Logger.pageLogger('task.js:editTaskIsDone:taskToBeUpdated', {
        taskToBeUpdated,
      });
      database.write(async () => {
        await taskToBeUpdated.update(task => {
          task.isDone = isDone;
          if (isDone) {
            task.doneTimestamp = Date.now();
          }
        });
      });

      dispatch(editTaskState({loading: false, success: true, error: null}));

      dispatch(getTasks());
      Logger.pageLogger('task.js:editTaskIsDone:success');
    } catch (error) {
      Logger.pageLogger('task.js:editTaskIsDone:catch', {error});
      dispatch(editTaskState({loading: false, success: true, error}));
    }
  };
export const editTaskEndTimestamp =
  ({id, endTimestamp}) =>
  async dispatch => {
    dispatch(editTaskState({loading: true, success: false, error: null}));
    try {
      const taskToBeUpdated = await database.get('tasks').find(id);
      Logger.pageLogger('task.js:editTaskEndTimestamp:taskToBeUpdated', {
        taskToBeUpdated,
      });
      database.write(async () => {
        await taskToBeUpdated.update(task => {
          task.endTimestamp = endTimestamp;
        });
      });

      dispatch(editTaskState({loading: false, success: true, error: null}));

      dispatch(getTasks());
      Logger.pageLogger('task.js:editTaskEndTimestamp:success');
    } catch (error) {
      Logger.pageLogger('task.js:editTaskEndTimestamp:catch', {error});
      dispatch(editTaskState({loading: false, success: true, error}));
    }
  };

export const editTaskStartTimestamp =
  ({id, startTimestamp}) =>
  async dispatch => {
    dispatch(editTaskState({loading: true, success: false, error: null}));
    try {
      const taskToBeUpdated = await database.get('tasks').find(id);
      Logger.pageLogger('task.js:editTaskStartTimestamp:taskToBeUpdated', {
        taskToBeUpdated,
      });
      database.write(async () => {
        await taskToBeUpdated.update(task => {
          task.startTimestamp = startTimestamp;
        });
      });

      dispatch(editTaskState({loading: false, success: true, error: null}));

      dispatch(getTasks());
      Logger.pageLogger('task.js:editTaskStartTimestamp:success');
    } catch (error) {
      Logger.pageLogger('task.js:editTaskStartTimestamp:catch', {error});
      dispatch(editTaskState({loading: false, success: true, error}));
    }
  };

export const editTaskAddReminder =
  ({id, reminderTimestamp}) =>
  async dispatch => {
    dispatch(editTaskState({loading: true, success: false, error: null}));
    try {
      const taskToBeUpdated = await database.get('tasks').find(id);
      Logger.pageLogger('task.js:editTaskAddReminder:taskToBeUpdated', {
        taskToBeUpdated,
      });
      Logger.pageLogger('task.js:editTaskAddReminder:reminderTimestamp', {
        reminderTimestamp: new Date(reminderTimestamp),
      });
      if (reminderTimestamp > 0) {
        if (taskToBeUpdated.reminderID) {
          NotificationService.cancelNotification(taskToBeUpdated.reminderID);
          Logger.pageLogger('task.js:editTaskAddReminder:cancel', {
            reminderID: taskToBeUpdated.reminderID,
          });
        }
        const notificationID = Math.floor(Math.random() * 1000) + 1;
        NotificationService.scheduleTaskReminder({
          notificationID,
          timestamp: reminderTimestamp,
          title: taskToBeUpdated.title,
        });
        Logger.pageLogger('task.js:editTaskAddReminder:notificationID', {
          notificationID,
        });
        database.write(async () => {
          await taskToBeUpdated.update(task => {
            task.reminderTimestamp = reminderTimestamp;
            task.reminderID = `${notificationID}`;
          });
        });
      } else {
        Logger.pageLogger('task.js:editTaskAddReminder:cancel', {
          reminderID: taskToBeUpdated.reminderID,
        });
        if (taskToBeUpdated.reminderID) {
          NotificationService.cancelNotification(taskToBeUpdated.reminderID);
          database.write(async () => {
            await taskToBeUpdated.update(task => {
              task.reminderTimestamp = 0;
              task.reminderID = '';
            });
          });
        }
      }

      dispatch(editTaskState({loading: false, success: true, error: null}));

      dispatch(getTasks());
      Logger.pageLogger('task.js:editTaskAddReminder:success');
    } catch (error) {
      Logger.pageLogger('task.js:editTaskAddReminder:catch', {error});
      dispatch(editTaskState({loading: false, success: true, error}));
    }
  };

export const editTaskRemoveReminder =
  ({id}) =>
  async dispatch => {
    dispatch(editTaskState({loading: true, success: false, error: null}));
    try {
      const taskToBeUpdated = await database.get('tasks').find(id);
      Logger.pageLogger('task.js:editTaskRemoveReminder:taskToBeUpdated', {
        taskToBeUpdated,
      });
      if (taskToBeUpdated.reminderID) {
        Logger.pageLogger('task.js:editTaskRemoveReminder:cancel', {
          reminderID: taskToBeUpdated.reminderID,
        });
        NotificationService.cancelNotification(taskToBeUpdated.reminderID);
      }
      database.write(async () => {
        await taskToBeUpdated.update(task => {
          task.reminderTimestamp = 0;
          task.reminderID = '';
        });
      });

      dispatch(editTaskState({loading: false, success: true, error: null}));

      dispatch(getTasks());
      Logger.pageLogger('task.js:editTaskRemoveReminder:success');
    } catch (error) {
      Logger.pageLogger('task.js:editTaskRemoveReminder:catch', {error});
      dispatch(editTaskState({loading: false, success: true, error}));
    }
  };

export const editTaskRemoveDueDate =
  ({id}) =>
  async dispatch => {
    dispatch(editTaskState({loading: true, success: false, error: null}));
    try {
      const taskToBeUpdated = await database.get('tasks').find(id);
      Logger.pageLogger('task.js:editTaskRemoveDueDate:taskToBeUpdated', {
        taskToBeUpdated,
      });
      database.write(async () => {
        await taskToBeUpdated.update(task => {
          task.endTimestamp = 0;
        });
      });
      dispatch(editTaskState({loading: false, success: true, error: null}));
      dispatch(getTasks());
      Logger.pageLogger('task.js:editTaskRemoveDueDate:success');
    } catch (error) {
      Logger.pageLogger('task.js:editTaskRemoveDueDate:catch', {error});
      dispatch(editTaskState({loading: false, success: true, error}));
    }
  };
export const editTaskIsRepeating =
  ({id, isRepeating}) =>
  async dispatch => {
    dispatch(editTaskState({loading: true, success: false, error: null}));
    try {
      const taskToBeUpdated = await database.get('tasks').find(id);
      Logger.pageLogger('task.js:editTaskIsRepeating:taskToBeUpdated', {
        taskToBeUpdated,
      });
      database.write(async () => {
        await taskToBeUpdated.update(task => {
          task.isRepeating = isRepeating;
        });
      });

      dispatch(editTaskState({loading: false, success: true, error: null}));

      dispatch(getTasks());
      Logger.pageLogger('task.js:editTaskIsRepeating:success');
    } catch (error) {
      Logger.pageLogger('task.js:editTaskIsRepeating:catch', {error});
      dispatch(editTaskState({loading: false, success: true, error}));
    }
  };
export const editTaskIsBookmark =
  ({id, isBookmarked}) =>
  async dispatch => {
    dispatch(editTaskState({loading: true, success: false, error: null}));
    try {
      const taskToBeUpdated = await database.get('tasks').find(id);
      Logger.pageLogger('task.js:editTaskIsBookmark:taskToBeUpdated', {
        taskToBeUpdated,
      });
      database.write(async () => {
        await taskToBeUpdated.update(task => {
          task.isBookmarked = isBookmarked;
        });
      });

      dispatch(editTaskState({loading: false, success: true, error: null}));

      dispatch(getTasks());
      Logger.pageLogger('task.js:editTaskIsBookmark:success');
    } catch (error) {
      Logger.pageLogger('task.js:editTaskIsBookmark:catch', {error});
      dispatch(editTaskState({loading: false, success: true, error}));
    }
  };

export const deleteTask =
  ({id}) =>
  async dispatch => {
    dispatch(deleteTaskState({loading: true, success: false, error: null}));
    try {
      const taskToBeDeleted = await database.get('tasks').find(id);
      Logger.pageLogger('task.js:deleteTask:taskToBeDeleted', {
        taskToBeDeleted,
      });
      await database.write(async () => {
        await taskToBeDeleted.destroyPermanently();
      });

      dispatch(deleteTaskState({loading: false, success: true, error: null}));
      dispatch(getTasks());
      Logger.pageLogger('task.js:deleteTask:success');
    } catch (error) {
      Logger.pageLogger('task.js:deleteTask:catch', {error});
      dispatch(deleteTaskState({loading: false, success: true, error}));
    }
  };

export const deleteMultipleTasks =
  ({ids}) =>
  async dispatch => {
    dispatch(
      deleteMultipleTasksState({
        loading: true,
        success: false,
        error: null,
      }),
    );
    try {
      const tasksToBeDeleted = await database
        .get('tasks')
        .query(Q.where('id', Q.oneOf(ids)))
        .fetch();
      Logger.pageLogger('task.js:deleteMultipleTasks:tasksToBeDeleted', {
        tasksToBeDeleted,
      });

      const deletedTasks = tasksToBeDeleted.map(task =>
        task.prepareDestroyPermanently(),
      );

      await database.write(async () => {
        await database.batch(...deletedTasks);
      });

      dispatch(
        deleteMultipleTasksState({
          loading: false,
          success: true,
          error: null,
        }),
      );
      dispatch(getTasks());
      Logger.pageLogger('task.js:deleteMultipleTasks:success');
    } catch (error) {
      Logger.pageLogger('task.js:deleteMultipleTasks:catch', {error});
      dispatch(
        deleteMultipleTasksState({loading: false, success: true, error}),
      );
    }
  };

export const addTaskToCalendar = async ({calendarID, taskID}) => {
  const task = await database.collections.get('tasks').find(taskID);
  const startDate = new Date(task.createdAt).toISOString();
  const endDate = new Date(task.end_timestamp).toISOString();
  Logger.pageLogger('task.js:deleteMultipleTasks:startDate,endDate', {
    startDate,
    endDate,
  });
  // return ReactNativeCalendarEvents.saveEvent(task.title, {
  //   calendarId: calendarID,
  //   startDate,
  //   endDate,
  // });
};
