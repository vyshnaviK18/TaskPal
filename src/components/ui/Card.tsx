import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  as?: keyof JSX.IntrinsicElements;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  interactive = false,
  as: Component = 'div',
  onClick,
}) => {
  const baseClasses = 'bg-white rounded-xl shadow-md transition-all duration-200 overflow-hidden';
  const interactiveClasses = interactive
    ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer'
    : '';

  return (
    <Component
      className={`${baseClasses} ${interactiveClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </Component>
  );
};

export default Card;