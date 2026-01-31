import { View } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';

interface ContextSelectorProps {
  contextType: 'personal' | 'relational' | 'collective';
  onContextTypeChange: (type: 'personal' | 'relational' | 'collective') => void;
}

export default function ContextSelector({
  contextType,
  onContextTypeChange,
}: ContextSelectorProps) {
  return (
    <View className="px-4 py-2 bg-white border-b border-neutral-200">
      <SegmentedButtons
        value={contextType}
        onValueChange={(value) =>
          onContextTypeChange(value as 'personal' | 'relational' | 'collective')
        }
        buttons={[
          { value: 'personal', label: 'Personal', icon: 'account' },
          { value: 'relational', label: 'Relational', icon: 'account-multiple' },
          { value: 'collective', label: 'Family', icon: 'home-group' },
        ]}
        density="small"
      />
    </View>
  );
}
