import { StyleSheet,TextInput } from "react-native";

export default function CustomTextInput ({placeholder,value, setValue}) {

    return (
        <TextInput
            style={styles.input}
            placeholder={placeholder}
            value={value}
            onChange={ev => setValue(ev.nativeEvent.text)}
            multiline={true}
        />
    );
};

const styles = StyleSheet.create({
    input: {
        fontSize: 20, 
        paddingVertical:5,
        paddingHorizontal: 10, 
        marginVertical: 5, 
        borderWidth: 0.3,
        borderRadius: 10,
        width: 250
    }
});