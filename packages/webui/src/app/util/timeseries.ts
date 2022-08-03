export class TimeSeries {
  private series = [] as {idx: number, value: number}[];
  constructor(public readonly limit: number) {}

  add(idx: number, value: number) {
    this.series.push({idx, value});
    const i = this.series.findIndex(r => r.idx > idx - this.limit);
    if(i > 0) {
      this.series.splice(0, i);
    }
  }

  get first() : {idx: number, value: number} {
    return this.series[0];
  }

  get last() : {idx: number, value: number} {
    return this.series[this.series.length-1];
  }

  get length() : number {
    return this.series.length;
  }

  clear() : void {
    this.series = [];
  }

  derive() : number {
    if(this.length < 2) {
      return undefined;
    }
    return (this.last.value - this.first.value) / (this.last.idx - this.first.idx);
  }
}
