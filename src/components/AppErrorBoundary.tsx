import { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { captureOperationalError } from '../observability';

type Props = { children: ReactNode };
type State = { failed: boolean };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, _info: ErrorInfo): void {
    captureOperationalError(error, 'render', 'react_render_failed');
  }

  private retry = () => this.setState({ failed: false });

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <View accessibilityRole="alert" style={styles.page}>
        <Text style={styles.mark}>N’apsak?</Text>
        <Text style={styles.title}>Bir şey yolunda gitmedi.</Text>
        <Text style={styles.copy}>Hata güvenli biçimde kaydedildi. Uygulamayı yeniden yüklemeyi deneyebilirsin.</Text>
        <TouchableOpacity accessibilityRole="button" onPress={this.retry} style={styles.button}>
          <Text style={styles.buttonText}>Yeniden dene</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  page: { flex: 1, justifyContent: 'center', backgroundColor: '#11120F', paddingHorizontal: 28 },
  mark: { color: '#D5FF4B', fontSize: 18, fontWeight: '900', marginBottom: 28 },
  title: { color: '#F8F4EA', fontSize: 30, lineHeight: 36, fontWeight: '900' },
  copy: { color: '#AAA79F', fontSize: 15, lineHeight: 22, marginTop: 12 },
  button: { minHeight: 56, justifyContent: 'center', alignItems: 'center', borderRadius: 16, backgroundColor: '#D5FF4B', marginTop: 28 },
  buttonText: { color: '#14160E', fontSize: 15, fontWeight: '900' },
});
