import { StyleSheet, View, Text } from "react-native";
import CustomTextInput from './CustomTextInput';

export default function CustomInputView ({placeholder, value, setValue, error}) {

    return (
        <View>
            <CustomTextInput placeholder={placeholder} value={value} setValue={setValue}/>
            {error.length > 0 && <Text style={styles.error}>* {error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    error: {
        color:"red"
    }
});