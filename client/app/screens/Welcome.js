import React, { Component } from "react";
import { SafeAreaView, Text } from "react-native";
import EStyleSheet from "react-native-extended-stylesheet";

import concertApi from "../api/concertApi";

class WelcomeScreen extends Component {
  constructor(props) {
    super(props);
    const { navigation } = props;
    concertApi.on("SHOW_COLOR_PICKER", stream => {
      navigation.navigate("Colors"); // temporary
    });
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.welcomeText}>
          Welcome to the Enchanted Brain Concert!
        </Text>
        <Text style={styles.messageText}>
          Please listen to the concert and wait to be prompted for a response.
        </Text>
      </SafeAreaView>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff"
  },
  welcomeText: {
    fontSize: "2rem",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: "1rem"
  },
  messageText: {
    fontSize: "1rem",
    textAlign: "center"
  }
});

export default WelcomeScreen;
