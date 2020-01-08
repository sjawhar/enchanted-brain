import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { Button } from 'react-native-elements';
import EStyleSheet from 'react-native-extended-stylesheet';

import COLORS from '../constants/Colors';
import Layout from '../constants/Layout';
import LANGUAGES, { LANGUAGE_EN, LANGUAGE_FR } from '../languages';
import { CHOICE_EMOTION_ANGER, CHOICE_EMOTION_HAPPINESS } from '../constants/Choices';

import { MESSAGE_INSTRUCTION_EMOTION } from '../constants/Messages';

const styles = EStyleSheet.create({
    button: {
        marginTop: 24,
        // width: '100%',
    },
    container: {
        // flex: 1,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 13,
    },
});

export default class InstructionsScreen extends Component {

    render() {
        console.debug('Instructions screen rendered')
        return (
            <View style={styles.container}>
                <Text>{MESSAGE_INSTRUCTION_EMOTION}</Text>
                <Button
                    buttonStyle={{ backgroundColor: COLORS.primaryOrange, ...styles.button }}
                    title={"Begin"}
                    onPress={() =>
                        this.props.navigation.navigate({
                            routeName: 'Synesthesia',
                            params: {
                                choiceType: CHOICE_EMOTION_ANGER,
                                choiceInverted: Math.random() < 0.5,
                                startTime: new Date().toISOString(),
                                endTime: new Date(Date.now() + 120 * 1000).toISOString(),
                                interval: 20,
                                timeout: 5,
                            },
                        })}
                />
            </View>
        );
    }
}
