import { Transaction } from '../types';

export const SAMPLE_CSV_TEXT = `date,merchant,description,amount
2026-05-01,Amazon Prime,Subscription,179
2026-05-01,Hotstar,Subscription,149
2026-05-01,ATM Withdrawal,Purchase,663
2026-05-01,Airtel Postpaid,Purchase,699
2026-05-02,Local Kirana Store,Purchase,145
2026-05-02,Swiggy Instamart,Purchase,589
2026-05-02,ATM Withdrawal,Purchase,733
2026-05-02,Local Kirana Store,Purchase,164
2026-05-03,Netflix,Subscription,199
2026-05-03,Spotify,Subscription,119
2026-05-04,Jio Fiber,Purchase,483
2026-05-05,Jio Fiber,Purchase,330
2026-05-05,Local Kirana Store,Purchase,904
2026-05-06,Amazon,Purchase,2081
2026-05-06,Swiggy Instamart,Purchase,353
2026-05-07,Electricity Board,Purchase,989
2026-05-07,Amazon,Purchase,578
2026-05-08,Myntra,Purchase,1138
2026-05-08,IRCTC,Purchase,173
2026-05-08,Blinkit,Purchase,532
2026-05-08,Airtel Postpaid,Purchase,468
2026-05-08,Myntra,Purchase,405
2026-05-09,Amazon,Purchase,1064
2026-05-09,Pharmacy,Purchase,444
2026-05-09,Water Board,Purchase,1078
2026-05-09,IRCTC,Purchase,223
2026-05-09,IRCTC,Purchase,66
2026-05-09,Ola,Purchase,354
2026-05-09,Ajio,Purchase,1200
2026-05-10,Myntra,Purchase,2305
2026-05-10,IRCTC,Purchase,276
2026-05-11,Airtel Postpaid,Purchase,865
2026-05-11,Flipkart,Purchase,1153
2026-05-11,Cafe Coffee Day,Purchase,137
2026-05-11,ATM Withdrawal,Purchase,921
2026-05-12,Local Kirana Store,Purchase,654
2026-05-12,Water Board,Purchase,1073
2026-05-13,Blinkit,Purchase,561
2026-05-13,Local Kirana Store,Purchase,101
2026-05-14,Myntra,Purchase,1218
2026-05-14,Blinkit,Purchase,279
2026-05-15,Swiggy,Purchase,276
2026-05-15,Myntra,Purchase,1402
2026-05-16,Local Kirana Store,Purchase,994
2026-05-16,Electricity Board,Purchase,553
2026-05-16,Airtel Postpaid,Purchase,883
2026-05-17,Local Kirana Store,Purchase,181
2026-05-17,Airtel Postpaid,Purchase,987
2026-05-18,IRCTC,Purchase,310
2026-05-18,Electricity Board,Purchase,732
2026-05-18,Blinkit,Purchase,390
2026-05-19,Electricity Board,Purchase,571
2026-05-20,Water Board,Purchase,494
2026-05-20,Pharmacy,Purchase,997
2026-05-21,Zomato,Purchase,552
2026-05-21,Ajio,Purchase,1716
2026-05-21,Jio Fiber,Purchase,764
2026-05-21,Ajio,Purchase,2409
2026-05-21,ATM Withdrawal,Purchase,108
2026-05-21,Amazon,Purchase,2009
2026-05-21,IRCTC,Purchase,140
2026-05-22,IRCTC,Purchase,258
2026-05-25,Rapido,Purchase,324
2026-05-26,Local Kirana Store,Purchase,783
2026-05-26,Pharmacy,Purchase,206
2026-05-27,Ajio,Purchase,2945
2026-05-27,Amazon,Purchase,2943
2026-05-28,Swiggy Instamart,Purchase,358
2026-05-28,Jio Fiber,Purchase,852
2026-05-28,Water Board,Purchase,852
2026-05-28,Flipkart,Purchase,439
2026-05-29,Local Kirana Store,Purchase,751
2026-05-29,Cafe Coffee Day,Purchase,57
2026-05-29,Water Board,Purchase,504
2026-05-31,Netflix,Subscription,199
2026-05-31,Amazon Prime,Subscription,179
2026-05-31,Myntra,Purchase,1287
2026-06-01,Spotify,Subscription,119
2026-06-01,Local Kirana Store,Purchase,217
2026-06-01,Uber,Purchase,337
2026-06-01,Water Board,Purchase,1103
2026-06-02,Hotstar,Subscription,149
2026-06-02,ATM Withdrawal,Purchase,616
2026-06-03,Local Kirana Store,Purchase,814
2026-06-03,Zomato,Purchase,632
2026-06-03,ATM Withdrawal,Purchase,185
2026-06-04,Local Kirana Store,Purchase,837
2026-06-04,IRCTC,Purchase,131
2026-06-05,Myntra,Purchase,836
2026-06-05,IRCTC,Purchase,392
2026-06-05,Ola,Purchase,286
2026-06-05,Jio Fiber,Purchase,345
2026-06-06,Ajio,Purchase,846
2026-06-06,Amazon,Purchase,2677
2026-06-08,Local Kirana Store,Purchase,729
2026-06-09,Rapido,Purchase,254
2026-06-09,Swiggy,Purchase,493
2026-06-10,Swiggy,Purchase,530
2026-06-10,Cafe Coffee Day,Purchase,267
2026-06-12,Zomato,Purchase,253
2026-06-13,Rapido,Purchase,102
2026-06-13,Rapido,Purchase,154
2026-06-14,Ajio,Purchase,2672
2026-06-15,Jio Fiber,Monthly Bill,799
2026-06-15,Jio Fiber,Monthly Bill,799
2026-06-15,Swiggy,Purchase,335
2026-06-16,Blinkit,Purchase,434
2026-06-18,Swiggy Instamart,Purchase,219
2026-06-18,Blinkit,Purchase,404
2026-06-18,Electricity Board,Purchase,576
2026-06-18,Blinkit,Purchase,159
2026-06-20,Water Board,Purchase,958
2026-06-21,Cafe Coffee Day,Purchase,420
2026-06-22,Water Board,Purchase,494
2026-06-22,Myntra,Purchase,2943
2026-06-23,Local Kirana Store,Purchase,275
2026-06-24,Cafe Coffee Day,Purchase,969
2026-06-24,Ajio,Purchase,1883
2026-06-25,Uber,Purchase,115
2026-06-26,Ajio,Purchase,2319
2026-06-28,Amazon,Purchase,1368
2026-06-28,Flipkart,Purchase,1495
2026-06-30,Netflix,Subscription,249
2026-06-30,Spotify,Subscription,119
2026-07-01,Water Board,Purchase,518
2026-07-01,Cafe Coffee Day,Purchase,564
2026-07-02,Amazon Prime,Subscription,179
2026-07-02,Hotstar,Subscription,149
2026-07-02,Myntra,Purchase,279
2026-07-04,Ola,Purchase,104
2026-07-04,Amazon,Purchase,2201
2026-07-06,Cafe Coffee Day,Purchase,373
2026-07-07,Amazon,Purchase,2684
2026-07-08,Swiggy Instamart,Purchase,338
2026-07-09,Cafe Coffee Day,Purchase,112
2026-07-09,Electricity Board,Purchase,1020
2026-07-10,Water Board,Purchase,469
2026-07-11,Ajio,Purchase,1864
2026-07-12,Pharmacy,Purchase,152
2026-07-13,Ajio,Purchase,987
2026-07-13,Uber,Purchase,345
2026-07-14,IRCTC,Purchase,354
2026-07-14,Ajio,Purchase,2463
2026-07-15,Electricity Board,Purchase,584
2026-07-15,Zomato,Purchase,355
2026-07-16,Airtel Postpaid,Purchase,779
2026-07-17,ATM Withdrawal,Purchase,77
2026-07-17,Swiggy Instamart,Purchase,295
2026-07-18,Flipkart,Purchase,2878
2026-07-19,Swiggy,Purchase,203
2026-07-20,Flipkart,Purchase,2733
2026-07-21,Electricity Board,Purchase,1154
2026-07-21,Flipkart,Purchase,2279
2026-07-24,Local Kirana Store,Purchase,785
2026-07-24,Jio Fiber,Purchase,897
2026-07-25,IRCTC,Purchase,102
2026-07-26,Swiggy Instamart,Purchase,360
2026-07-27,Ola,Purchase,266
2026-07-27,Zomato,Purchase,237
2026-07-28,Swiggy Instamart,Purchase,272
2026-07-29,Amazon,Purchase,2999
2026-07-29,Jio Fiber,Purchase,1048
2026-07-30,Swiggy Instamart,Purchase,180
2026-07-30,Local Kirana Store,Purchase,487`;
