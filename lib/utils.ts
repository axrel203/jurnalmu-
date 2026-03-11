import { format, formatDistanceToNow } from 'date-fns'

export const MOODS = [
    { value: 'happy', label: 'Senang', emoji: '😊', color: 'text-yellow-400', bg: 'bg-yellow-400/20', border: 'border-yellow-400/50' },
    { value: 'excited', label: 'Semangat', emoji: '🤩', color: 'text-orange-400', bg: 'bg-orange-400/20', border: 'border-orange-400/50' },
    { value: 'neutral', label: 'Biasa Saja', emoji: '😐', color: 'text-blue-400', bg: 'bg-blue-400/20', border: 'border-blue-400/50' },
    { value: 'sad', label: 'Sedih', emoji: '😢', color: 'text-indigo-400', bg: 'bg-indigo-400/20', border: 'border-indigo-400/50' },
    { value: 'angry', label: 'Marah', emoji: '😠', color: 'text-red-400', bg: 'bg-red-400/20', border: 'border-red-400/50' },
    { value: 'anxious', label: 'Cemas', emoji: '😰', color: 'text-purple-400', bg: 'bg-purple-400/20', border: 'border-purple-400/50' },
    { value: 'grateful', label: 'Bersyukur', emoji: '🙏', color: 'text-green-400', bg: 'bg-green-400/20', border: 'border-green-400/50' },
    { value: 'tired', label: 'Lelah', emoji: '😴', color: 'text-gray-400', bg: 'bg-gray-400/20', border: 'border-gray-400/50' },
    { value: 'love', label: 'Cinta', emoji: '🥰', color: 'text-pink-400', bg: 'bg-pink-400/20', border: 'border-pink-400/50' },
]

export function getMoodInfo(moodValue: string) {
    const mood = MOODS.find(m => m.value === moodValue)
    if (mood) return mood

    // Jika moodValue bukan dari list predefined, tapi berisi emoji/teks custom
    if (moodValue && moodValue !== 'neutral') {
        const isEmoji = moodValue.length <= 4;
        return {
            value: moodValue,
            label: isEmoji ? 'Mood' : 'Perasaan',
            emoji: moodValue,
            color: 'text-pink-400',
            bg: 'bg-pink-400/20',
            border: 'border-pink-400/50'
        }
    }

    return MOODS[2] // Default: Neutral
}

export function formatDate(date: string | Date) {
    return format(new Date(date), 'd MMMM yyyy')
}

export function formatDateShort(date: string | Date) {
    return format(new Date(date), 'MMM d')
}

export function formatRelative(date: string | Date) {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function truncate(text: string, length = 120) {
    if (text.length <= length) return text
    return text.slice(0, length).trim() + '...'
}

export function cn(...classes: (string | undefined | null | boolean)[]) {
    return classes.filter(Boolean).join(' ')
}
