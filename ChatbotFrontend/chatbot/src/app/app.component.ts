import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const dialogflowURL = 'http://localhost:3000/test';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'chatbot';
  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.http.get(dialogflowURL)
    .subscribe(res => {
      console.log(res);
    });
  }

}
