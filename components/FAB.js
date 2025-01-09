import { StyleSheet,Pressable} from "react-native";
import AntDesign from '@expo/vector-icons/AntDesign';

export default function FAB ({setIsVisible}) {
    const icon = <AntDesign name="plus" size={24} color="#26653A" />
    return (
        <Pressable style={styles.container} onPress={() => {
            console.log("Hello!");
            setIsVisible(true);
        }}>
            {icon}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderRadius: 100,
        position: "absolute",
        bottom: 30,
        right: 20,
        fontWeight: "800",
        borderColor: "#26653A",
        backgroundColor: "#fff",
        borderWidth: 2,
        opacity: 0.95
    }
});