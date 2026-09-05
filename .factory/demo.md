# Demo sandbox

Open the demo at `https://season-gap-garden.sociobot.in/?demo=1`. The visible
**Try it with sample data** link also opens `/demo`, which redirects to that
same URL.

The sample contains three realistic small-space beds, five dated crop entries,
four personal crop-duration notes, and visible open windows. It is enough to
review the gap view, choose a follow-on crop, export data, and test restore.

Demo records use the separate IndexedDB database named
`demo:season-gap-garden`. The real planner uses `season-gap-garden`. The demo
does not read or write the real database. Its persistent banner offers **Reset
demo**, which restores the supplied sample, and **Start for real**, which
deletes the demo database before opening the empty real planner.

The sample is bundled into the application, so it remains available for the
offline-reload claim after the first online visit has installed the service
worker.
