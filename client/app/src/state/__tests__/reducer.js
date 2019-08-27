import * as actions from '../actions';
import reducer from '../reducer';

describe('root reducer', () => {
  it('should cleanly initialize state', () => {
    const state = reducer(undefined, { type: '' });
    expect(state.choiceType).toEqual('CHOICE_COLOR');
    expect(state.choiceInverted).toEqual(false);
    expect(state.choices.colors).toEqual([]);
    expect(state.choices.chills).toEqual([]);
    expect(state.choices.emotions).toEqual([]);
  });

  describe(actions.SEND_CHOICE, () => {
    it('should add the CHOICE_COLOR to choices.colors', () => {
      const expected = { choiceType: 'CHOICE_COLOR', choice: 'foo' };
      const state = reducer(undefined, actions.sendChoice(expected));
      expect(state.choices.colors.length).toEqual(1);
      expect(state.choices.colors).toEqual(
        expect.arrayContaining([expect.objectContaining(expected)])
      );
    });

    it('should add the CHOICE_EMOTION_HAPPINESS to choices.emotions', () => {
      const expected = { choiceType: 'CHOICE_EMOTION_HAPPINESS', choice: 'foo' };
      const state = reducer(undefined, actions.sendChoice(expected));
      expect(state.choices.emotions.length).toEqual(1);
      expect(state.choices.emotions).toEqual(
        expect.arrayContaining([expect.objectContaining(expected)])
      );
    });

    it('should add the CHOICE_EMOTION_ANGER to choices.emotions', () => {
      const expected = { choiceType: 'CHOICE_EMOTION_ANGER', choice: 'foo' };
      const state = reducer(undefined, actions.sendChoice(expected));
      expect(state.choices.emotions.length).toEqual(1);
      expect(state.choices.emotions).toEqual(
        expect.arrayContaining([expect.objectContaining(expected)])
      );
    });

    it('should add the CHOICE_CHILLS to choices.chills', () => {
      const expected = { choiceType: 'CHOICE_CHILLS', choice: 'foo' };
      const state = reducer(undefined, actions.sendChoice(expected));
      expect(state.choices.chills.length).toEqual(1);
      expect(state.choices.chills).toEqual(
        expect.arrayContaining([expect.objectContaining(expected)])
      );
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
