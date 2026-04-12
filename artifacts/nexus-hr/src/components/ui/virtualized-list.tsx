import { Virtuoso, VirtuosoProps } from "react-virtuoso";
import { memo } from "react";

interface VirtualizedListProps<T> {
  data: T[];
  itemContent: (index: number, item: T) => React.ReactNode;
  className?: string;
  overscan?: number;
  estimatedItemHeight?: number;
  endReached?: () => void;
  isLoadingMore?: boolean;
  emptyMessage?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  style?: React.CSSProperties;
}

function VirtualizedListInner<T>({
  data,
  itemContent,
  className,
  overscan = 200,
  estimatedItemHeight = 64,
  endReached,
  isLoadingMore,
  emptyMessage = "No items to display",
  header,
  footer,
  style,
}: VirtualizedListProps<T>) {
  if (data.length === 0) {
    return (
      <div className={className}>
        {header}
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          {emptyMessage}
        </div>
        {footer}
      </div>
    );
  }

  const virtuosoProps: Partial<VirtuosoProps<T, unknown>> = {
    data,
    itemContent,
    overscan: { main: overscan, reverse: overscan },
    defaultItemHeight: estimatedItemHeight,
    style: { height: "100%", ...style },
    className,
  };

  if (endReached) {
    virtuosoProps.endReached = endReached;
  }

  if (header) {
    virtuosoProps.components = {
      ...virtuosoProps.components,
      Header: () => <>{header}</>,
    };
  }

  if (footer || isLoadingMore) {
    virtuosoProps.components = {
      ...virtuosoProps.components,
      Footer: () => (
        <>
          {isLoadingMore && (
            <div className="flex items-center justify-center py-4">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
          {footer}
        </>
      ),
    };
  }

  return <Virtuoso<T> {...virtuosoProps} />;
}

export const VirtualizedList = memo(VirtualizedListInner) as <T>(
  props: VirtualizedListProps<T>,
) => React.ReactElement;
