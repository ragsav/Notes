import {combineReducers} from 'redux';
import label from './label';
import note from './note';
import task from './task';
import permission from './permission';
import timeFrame from './timeFrame';
import settings from './settings';
export default combineReducers({
  permission,
  label,
  note,
  task,
  timeFrame,
  settings,
});
