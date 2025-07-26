"use client"

import React, { forwardRef, useEffect, useState } from 'react';
import classNames from 'classnames';
import styles from './Spinner.module.scss';

interface SpinnerProps {
    size?: 'xs' | 's' | 'm' | 'l' | 'xl';
    ariaLabel?: string;
    className?: string;
    style?: React.CSSProperties;
    timeout?: number;
    overlay?: boolean;
}

const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(({
    size = 'xl',
    className,
    style,
    ariaLabel = 'Loading',
    timeout = 10000,
    overlay = true
}, ref) => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (timeout) {
            const timer = setTimeout(() => setLoading(false), timeout);
            return () => clearTimeout(timer);
        }
    }, [timeout]);

    if (!loading) return null;

    const spinnerContent = (
        <div
            ref={ref}
            className={classNames(
                styles.bounding,
                styles[size],
                className,
                { [styles.overlay]: overlay }
            )}
            style={style}
            role="status"
            aria-label={ariaLabel}
        >
            <div className={styles.loader}>
                {Array.from({ length: 20 }).map((_, i) => (
                    <span key={i} style={{ '--i': i } as React.CSSProperties}></span>
                ))}
            </div>
        </div>
    );

    return overlay ? (
        <div className={styles.overlayContainer}>
            {spinnerContent}
        </div>
    ) : spinnerContent;
});

Spinner.displayName = 'Spinner';

export { Spinner };