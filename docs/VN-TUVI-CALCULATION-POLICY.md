# Vietnamese Tử Vi Calculation Policy

Policy: `VN-TUVI-1.0@1.2.0`
Engine: `gyeol-tu-vi-core@1.2.0`
Calendar: Vietnamese lunisolar calendar, GMT+7 / 105°E.

## Selected rules

- A resolved birth instant is projected to GMT+7 before converting its civil date with the versioned Hồ Ngọc Đức Vietnamese lunisolar algorithm in `chart/vietnamese-lunar-calendar.mjs`.
- The twelve double-hour branch is derived from the original birthplace civil clock supplied with the profile; the app's Korean input path uses `Asia/Seoul` civil time.
- The leap lunar month uses the same-numbered regular month for month-based Tử Vi placement. The result preserves the leap flag.
- Mệnh, Thân, Five-Element Bureau, Zi Wei placement, major stars, four transformations, and supported auxiliary stars follow the stated Quanshu-lineage rules and retain their existing oracle fixtures.
- Đại Hạn direction is forward for yang-year male / yin-year female, and backward for yin-year male / yang-year female. Tiểu Hạn is backward for male and forward for female. No sex value is inferred; without it, those cycle fields are unavailable.
- Annual Lưu Niên output is limited to year-branch palace and star-placement facts. Annual prediction prose and a daily palace rotation are not emitted without source-locked interpretation rules.

## Inputs and limits

Exact birth time is required for Mệnh/Thân and star placement. Unknown time is not replaced with noon. The shared Korean profile path requires a resolved `Asia/Seoul` instant; unsupported time zones are blocked instead of being interpreted as Seoul. The engine accepts solar birth dates in 1900–2100.

Different Tử Vi lineages can use different leap-month and minor-star conventions. The policy above is the selected version, not a claim that every Vietnamese school uses it.

## Verification

`tests/unit/tu-vi.mjs` checks the 1985 Vietnam/China calendar divergence, the 1985 Vietnamese leap-month interval, existing non-divergence chart fixtures, both Đại Hạn directions, both Tiểu Hạn directions, missing-time rejection, and suppression of unsupported daily/annual interpretation prose.

## References

- [Hồ Ngọc Đức: Vietnamese lunar-calendar rules and algorithms](https://xemamlich.uhm.vn/calrules_en.html)
- [Hồ Ngọc Đức: Vietnamese lunar calendar implementation and 1985 Vietnam/China divergence](https://xemamlich.uhm.vn/vncal_en.html)
- [Vietnamese Tử Vi: common yin/yang-year and gender direction rule](https://solqi.net/am-duong-thuan-ly-dai-han-thuan-hanh)
- [Lịch Ngày Tốt: Tử Vi chart construction; leap month treated as the same numbered month](https://lichngaytot.com/tu-vi/cac-buoc-lap-la-so-tu-vi-304-217457.html)
