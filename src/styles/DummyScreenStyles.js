import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F0F0',
    },
    canvas: {
        flex: 1,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
    button: {
        backgroundColor: '#4A90E2',
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        minWidth: 50,
    },
    runButton: {
        backgroundColor: '#E74C3C',
    },
    jumpButton: {
        backgroundColor: '#9B59B6',
    },
    danceButton: {
        backgroundColor: '#E67E22',
    },
    waveButton: {
        backgroundColor: '#27AE60',
    },
    clapButton: {
        backgroundColor: '#3498DB',
    },
    sadButton: {
        backgroundColor: '#5DADE2',
    },
    angryButton: {
        backgroundColor: '#C0392B',
    },
    romanceButton: {
        backgroundColor: '#FF69B4',
    },
    speechButton: {
        backgroundColor: '#8E44AD',
    },
    buttonActive: {
        backgroundColor: '#2C3E50',
    },
    buttonText: {
        fontSize: 22,
    },
});
