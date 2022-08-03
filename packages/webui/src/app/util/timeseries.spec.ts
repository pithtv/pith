import {TimeSeries} from "./timeseries";

describe('Timeseries', () => {
  it('should add entries', () => {
    const series = new TimeSeries(1000);
    series.add(5000, 5);
    expect(series.first).toEqual({idx: 5000, value: 5});
    expect(series.last).toEqual({idx: 5000, value: 5});
    expect(series.length).toEqual(1);
    series.add(5100, 6);
    expect(series.first).toEqual({idx: 5000, value:5 });
    expect(series.last).toEqual({idx: 5100, value:6 });
    expect(series.length).toEqual(2);
  })

  it('should drop entries beyond the limit', () => {
    const series = new TimeSeries(1000);

    series.add(5000, 5);
    series.add(5100, 6);
    series.add(5200, 7);
    expect(series.length).toEqual(3);
    series.add(6100, 8);
    expect(series.length).toEqual(2);
    expect(series.first).toEqual({idx: 5200, value: 7});
    expect(series.last).toEqual({idx: 6100, value: 8});
    series.add(7100, 9);
    expect(series.length).toEqual(1);
    expect(series.first).toEqual({idx: 7100, value: 9});
    expect(series.last).toEqual({idx: 7100, value: 9});
  })

  it('should be empty after clearing', () => {
    const series = new TimeSeries(1000);
    series.add(5000, 5);
    series.add(5100, 6);
    expect(series.length).toEqual(2);
    series.clear();
    expect(series.length).toEqual(0);
  })

  it('should derive a speed', () => {
    const series = new TimeSeries(1000);
    series.add(5000, 5);
    series.add(5100, 6);
    series.add(5200, 7);
    expect(series.derive()).toEqual(2/200);
  })

  it('derive should return undefined when insufficient data', () => {
    const series = new TimeSeries(1000);
    expect(series.derive()).toBeUndefined();
    series.add(5000, 5);
    expect(series.derive()).toBeUndefined();
  })
})
