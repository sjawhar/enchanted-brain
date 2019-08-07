import * as actions from '../actions';
import * as actionTypes from '../actionTypes';
import reducer from '../reducer';

describe('root reducer', () => {
  it('should cleanly initialize state', () => {
    const state = reducer(undefined, { type: '' });
    expect(state.choiceType).toEqual('CHOICE_COLOR');
    expect(state.choiceInverted).toEqual(false);
  });

  describe(actionTypes.SET_CHOICE_TYPE, () => {
    it('should set the choice type', () => {
      const state = reducer(undefined, actions.setChoiceType('pineapple'));
      expect(state.choiceType).toEqual('pineapple');
    });
  });

  describe(actionTypes.SET_CHOICE_INVERTED, () => {
    it('should set choice inverted', () => {
      const state = reducer(undefined, actions.setChoiceInverted(true));
      expect(state.choiceInverted).toBeTruthy();
    });
  });

  describe(actionTypes.SET_UID, () => {
    it('should set the user id', () => {
      const state = reducer(undefined, actions.setUID('watermelon'));
      expect(state.uid).toEqual('watermelon');
    });
  });
});
