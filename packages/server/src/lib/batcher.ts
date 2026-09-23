export async function batch<T, R>(items: T[], batchSize: number, func: (batch: T[]) => Promise<R[]>): Promise<R[]> {
    const results: R[] = [];
    for (let i = 0; i < items.length; i += batchSize) {
        const batchItems = items.slice(i, i + batchSize);
        const result = await func(batchItems);
        // append result to the results array
        results.push(...result);
    }
    return results;
}