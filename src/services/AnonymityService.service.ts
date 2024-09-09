import { Injectable, signal } from '@angular/core';
import { Person } from '../models/Person';

@Injectable({
  providedIn: 'root'
})
export class AnonymityService {
  isAnonymityEnabled = signal<boolean>(true)
  anonymity = signal<Person[]>([])

  constructor() { }

  isAnonymous(person: Person): boolean {
    if (!this.isAnonymityEnabled()) {
      return false;
    }
    var anonymity = this.anonymity();
    var isInAnonymity = anonymity.some(person_ => person_.name == person.name);
    return isInAnonymity === false;
  }

  isCompletelyAnonymous(): boolean {
    if (!this.isAnonymityEnabled()) {
      return false;
    }
    var anonymity = this.anonymity();
    return anonymity.length === 0;
  }
}
