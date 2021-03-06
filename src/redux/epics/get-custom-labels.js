import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import {
  getCustomLabelsSuccess,
  getCustomLabelsFailure,
  GET_CUSTOM_LABELS,
} from '../actions';

export default ({ customLabelsApi }) => (action$, store) => {
  return action$
    .filter(action => action.type === GET_CUSTOM_LABELS)
    .mergeMap(action => {
      const {
        payload: credentialId,
      } = action;

      return customLabelsApi
        .getAll(store.getState().okapi, credentialId)
        .map(response => getCustomLabelsSuccess(response))
        .catch(errors => Observable.of(getCustomLabelsFailure({ errors })));
    });
};
