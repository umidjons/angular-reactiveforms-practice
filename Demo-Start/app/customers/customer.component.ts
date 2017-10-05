import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import 'rxjs/add/operator/debounceTime';

import { Customer } from './customer';

function emailMatcher(c: AbstractControl) {
    let emailControl = c.get('email');
    let confirmControl = c.get('confirmEmail');

    if (emailControl.pristine || confirmControl.pristine) {
        return null;
    }

    if (emailControl.value === confirmControl.value) {
        return null;
    }

    return {'match': true};
}

function ratingRange(min: number, max: number): ValidatorFn {
    return (c: AbstractControl): {[key: string]: boolean} | null => {
        if (c.value !== undefined && (isNaN(c.value) || c.value < min || c.value > max)) {
            return {'range': true};
        }

        return null;
    };
}

@Component({
    selector: 'my-signup',
    templateUrl: './app/customers/customer.component.html'
})
export class CustomerComponent implements OnInit {
    customerForm: FormGroup;
    customer: Customer= new Customer();
    emailMessage: string;

    private validationMessages = {
        required: 'Please enter your email address',
        pattern: 'Please enter a valid email address'
    };

    constructor(private fb: FormBuilder) { }

    ngOnInit(): void {
        this.customerForm = this.fb.group({
            firstName: ['', [Validators.required, Validators.minLength(3)]],
            lastName: ['', [Validators.required, Validators.maxLength(50)]],
            emailGroup: this.fb.group({
                email: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+')]],
                confirmEmail: ['', Validators.required]
            }, {validator: emailMatcher}),
            phone: '',
            notification: 'email',
            rating: ['', ratingRange(1, 5)],
            sendCatalog: true,
            addresses: this.fb.group({
                addressType: 'home',
                street1: '',
                street2: '',
                city: '',
                state: '',
                zip: ''
            })
        });

        this.customerForm.get('notification').valueChanges.subscribe(value => this.setNotification(value));
        const emailControl = this.customerForm.get('emailGroup.email');
        emailControl.valueChanges.debounceTime(1000).subscribe(value => this.setMessage(emailControl));
    }

    setMessage(c: AbstractControl): void {
        this.emailMessage = '';

        if ((c.touched || c.dirty) && c.errors) {
            this.emailMessage = Object.keys(c.errors)
                .map(key => this.validationMessages[key])
                .join(' ');
        }
    }

    setNotification(notifyVia: string): void {
        const phoneControl = this.customerForm.get('phone');
        if (notifyVia === 'text') {
            phoneControl.setValidators(Validators.required);
            // or specify set of validators with array
            // phoneControl.setValidators([Validators.required]);
        } else {
            phoneControl.clearValidators();
        }
        // re-evaluate form-control validition rules
        phoneControl.updateValueAndValidity();
    }

    populateTestData(): void {
        this.customerForm.patchValue({
            firstName: 'Jack',
            lastName: 'Harkness',
            sendCatalog: false
        });
    }

    save() {
        console.log(this.customerForm);
        console.log('Saved: ' + JSON.stringify(this.customerForm.value));
    }
 }
