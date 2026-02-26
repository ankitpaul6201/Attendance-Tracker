export const Logo = ({ size = 32 }: { size?: number }) => {
    return (
        <div
            style={{
                width: size,
                height: size,
                background: '#0A0A0A',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #2A2A2A',
                flexShrink: 0
            }}
        >
            <svg
                width={size * 0.625}
                height={size * 0.625}
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-primary-start)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M18 20V10" />
                <path d="M12 20V4" />
                <path d="M6 20v-6" />
            </svg>
        </div>
    );
};
