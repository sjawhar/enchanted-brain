import * as actions from '../actions';
import reducer from '../reducer';

describe('root reducer', () => {
  it('should cleanly initialize state', () => {
    const state = reducer(undefined, { type: '' });
    expect(state.choiceType).toEqual('CHOICE_COLOR');
    expect(state.choiceInverted).toEqual(false);
    expect(state.choices.colors).toEqual({});
    expect(state.choices.chills).toEqual({});
    expect(state.choices.emotions).toEqual({});
    expect(state.demographics).toEqual({});
  });

  describe(actions.SEND_CHOICE, () => {
    it('should add the CHOICE_COLOR to choices.colors', () => {
      const expected = { choiceType: 'CHOICE_COLOR', choice: 'foo' };
      const timestamp = new Date().toISOString();
      const state = reducer(undefined, actions.sendChoice({ ...expected, timestamp }));
      expect(Object.keys(state.choices.colors).length).toEqual(1);
      expect(state.choices.colors[timestamp]).toEqual(expected);
    });

    it('should add the CHOICE_EMOTION_HAPPINESS to choices.emotions', () => {
      const expected = { choiceType: 'CHOICE_EMOTION_HAPPINESS', choice: 'foo' };
      const timestamp = new Date().toISOString();
      const state = reducer(undefined, actions.sendChoice({ ...expected, timestamp }));
      expect(Object.keys(state.choices.emotions).length).toEqual(1);
      expect(state.choices.emotions[timestamp]).toEqual(expected);
    });

    it('should add the CHOICE_EMOTION_ANGER to choices.emotions', () => {
      const expected = { choiceType: 'CHOICE_EMOTION_ANGER', choice: 'foo' };
      const timestamp = new Date().toISOString();
      const state = reducer(undefined, actions.sendChoice({ ...expected, timestamp }));
      expect(Object.keys(state.choices.emotions).length).toEqual(1);
      expect(state.choices.emotions[timestamp]).toEqual(expected);
    });

    it('should add the CHOICE_CHILLS to choices.chills', () => {
      const expected = { choiceType: 'CHOICE_CHILLS', choice: 'foo' };
      const timestamp = new Date().toISOString();
      const state = reducer(undefined, actions.sendChoice({ ...expected, timestamp }));
      expect(Object.keys(state.choices.chills).length).toEqual(1);
      expect(state.choices.chills[timestamp]).toEqual(expected);
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

  describe(actions.SET_DEMOGRAPHICS, () => {
    it('should set demographics', () => {
      const state = reducer(undefined, actions.setDemographics({ colorPerception: '0' }));
      expect(state.demographics).toEqual({ colorPerception: 0 });
    });
  });

  describe(actions.SET_UID, () => {
    it('should set the user id', () => {
      const state = reducer(undefined, actions.setUID('watermelon'));
      expect(state.uid).toEqual('watermelon');
    });
  });
});
