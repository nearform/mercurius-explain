## Benchmark Results


  The query is:
  ```
  {
    query: `{
      users {
        name
        status {
          enabled
        }
        addresses {
          zip
        }
      }
  }`
  ```
### Mercurius Explain Enabled
```
┌─────────┬──────┬──────┬───────┬──────┬─────────┬─────────┬───────┐
│ Stat    │ 2.5% │ 50%  │ 97.5% │ 99%  │ Avg     │ Stdev   │ Max   │
├─────────┼──────┼──────┼───────┼──────┼─────────┼─────────┼───────┤
│ Latency │ 1 ms │ 3 ms │ 4 ms  │ 4 ms │ 2.73 ms │ 0.79 ms │ 15 ms │
└─────────┴──────┴──────┴───────┴──────┴─────────┴─────────┴───────┘
┌───────────┬─────────┬─────────┬─────────┬─────────┬─────────┬────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%   │ Avg     │ Stdev  │ Min     │
├───────────┼─────────┼─────────┼─────────┼─────────┼─────────┼────────┼─────────┤
│ Req/Sec   │ 2803    │ 2803    │ 3083    │ 3399    │ 3133.2  │ 204.73 │ 2803    │
├───────────┼─────────┼─────────┼─────────┼─────────┼─────────┼────────┼─────────┤
│ Bytes/Sec │ 2.27 MB │ 2.27 MB │ 2.49 MB │ 2.75 MB │ 2.54 MB │ 166 kB │ 2.27 MB │
└───────────┴─────────┴─────────┴─────────┴─────────┴─────────┴────────┴─────────┘

Req/Bytes counts sampled once per second.
# of samples: 10

31k requests in 10.01s, 25.4 MB read
```
### Mercurius Explain Disabled
```
┌─────────┬──────┬──────┬───────┬──────┬─────────┬─────────┬──────┐
│ Stat    │ 2.5% │ 50%  │ 97.5% │ 99%  │ Avg     │ Stdev   │ Max  │
├─────────┼──────┼──────┼───────┼──────┼─────────┼─────────┼──────┤
│ Latency │ 1 ms │ 2 ms │ 4 ms  │ 4 ms │ 2.32 ms │ 0.78 ms │ 6 ms │
└─────────┴──────┴──────┴───────┴──────┴─────────┴─────────┴──────┘
┌───────────┬────────┬────────┬─────────┬─────────┬─────────┬───────┬────────┐
│ Stat      │ 1%     │ 2.5%   │ 50%     │ 97.5%   │ Avg     │ Stdev │ Min    │
├───────────┼────────┼────────┼─────────┼─────────┼─────────┼───────┼────────┤
│ Req/Sec   │ 2975   │ 2975   │ 3439    │ 3647    │ 3416.2  │ 193.5 │ 2974   │
├───────────┼────────┼────────┼─────────┼─────────┼─────────┼───────┼────────┤
│ Bytes/Sec │ 1.1 MB │ 1.1 MB │ 1.28 MB │ 1.35 MB │ 1.27 MB │ 72 kB │ 1.1 MB │
└───────────┴────────┴────────┴─────────┴─────────┴─────────┴───────┴────────┘

Req/Bytes counts sampled once per second.
# of samples: 10

34k requests in 10s, 12.7 MB read
```
### Mercurius Explain Enabled with 50s resolver timeout
```
┌─────────┬────────┬────────┬────────┬────────┬───────────┬─────────┬────────┐
│ Stat    │ 2.5%   │ 50%    │ 97.5%  │ 99%    │ Avg       │ Stdev   │ Max    │
├─────────┼────────┼────────┼────────┼────────┼───────────┼─────────┼────────┤
│ Latency │ 101 ms │ 104 ms │ 107 ms │ 107 ms │ 104.17 ms │ 1.35 ms │ 107 ms │
└─────────┴────────┴────────┴────────┴────────┴───────────┴─────────┴────────┘
┌───────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%   │ Avg     │ Stdev   │ Min     │
├───────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ Req/Sec   │ 90      │ 90      │ 90      │ 100     │ 95      │ 5       │ 90      │
├───────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ Bytes/Sec │ 73.4 kB │ 73.4 kB │ 73.4 kB │ 81.5 kB │ 77.4 kB │ 4.06 kB │ 73.3 kB │
└───────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘

Req/Bytes counts sampled once per second.
# of samples: 10

960 requests in 10.01s, 774 kB read
```
### Mercurius Explain Disabled with 50s resolver timeout
```
┌─────────┬────────┬────────┬────────┬────────┬───────────┬────────┬────────┐
│ Stat    │ 2.5%   │ 50%    │ 97.5%  │ 99%    │ Avg       │ Stdev  │ Max    │
├─────────┼────────┼────────┼────────┼────────┼───────────┼────────┼────────┤
│ Latency │ 103 ms │ 105 ms │ 106 ms │ 108 ms │ 104.64 ms │ 1.1 ms │ 109 ms │
└─────────┴────────┴────────┴────────┴────────┴───────────┴────────┴────────┘
┌───────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%   │ Avg     │ Stdev   │ Min     │
├───────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ Req/Sec   │ 90      │ 90      │ 90      │ 100     │ 95      │ 5       │ 90      │
├───────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ Bytes/Sec │ 33.4 kB │ 33.4 kB │ 33.4 kB │ 37.1 kB │ 35.2 kB │ 1.86 kB │ 33.4 kB │
└───────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘

Req/Bytes counts sampled once per second.
# of samples: 10

960 requests in 10.01s, 352 kB read
```
