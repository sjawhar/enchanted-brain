import * as actions from '../actions';
import reducer from '../reducer';

describe('root reducer', () => {
  it('should cleanly initialize state', () => {
    const state = reducer(undefined, { type: '' });
    expect(state.choiceType).toEqual('CHOICE_COLOR');
    expect(state.choiceInverted).toEqual(false);
    expect(state.choices).toEqual([]);
  });

  describe(actions.SEND_CHOICE, () => {
    it('should add the choice to choices', () => {
      const expected = { foo: 'bar' };
      const state = reducer(undefined, actions.sendChoice(expected));
      expect(state.choices.length).toEqual(1);
      expect(state.choices).toEqual(expect.arrayContaining([expect.objectContaining(expected)]));
    });
  });

  describe(actions.SET_CHOICE_TYPE, () => {
    it('should set the choice type', () => {
      const state = reducer(undefined, actions.setChoiceType('pineapple'));
      expect(state.choiceType).toEqual('pineapple');
    });
  });

  describe(actions.SET_CHOICE_INVERTED, () => {
    it('should set choice inverted', () => {
      const state = reducer(undefined, actions.setChoiceInverted(true));
      expect(state.choiceInverted).toBeTruthy();
    });
  });

  describe(actions.SET_UID, () => {
    it('should set the user id', () => {
      const state = reducer(undefined, actions.setUID('watermelon'));
      expect(state.uid).toEqual('watermelon');
    });
  });
});
